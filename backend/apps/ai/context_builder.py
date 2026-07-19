import re

from apps.ai import selectors as ai_selectors
from apps.analytics.selectors import get_dashboard_stats, get_top_products
from apps.customers.selectors import get_customers_for_store
from apps.products.selectors import get_categories_with_active_products, get_low_stock_products, get_products_for_store

NAME_AFTER_PREPOSITION = re.compile(r"\b(?:de|pour|chez)\s+([A-ZÀ-Ý][\wÀ-ÿ'-]+(?:\s+[A-ZÀ-Ý][\wÀ-ÿ'-]+)?)")

INTENT_KEYWORDS = {
    "orders": ["commande", "commandé", "vente", "achat", "livr"],
    "products": ["produit", "stock", "rupture", "catalogue", "article"],
    "customers": ["client", "acheteur"],
    "revenue": ["revenu", "chiffre d'affaires", "ca ", "gagné", "argent"],
}


def _detect_intents(question: str) -> set[str]:
    lowered = question.lower()
    intents = {intent for intent, keywords in INTENT_KEYWORDS.items() if any(kw in lowered for kw in keywords)}
    return intents or {"general"}


class MerchantContextBuilder:
    """Assembles the smallest context that answers a given merchant-facing need.
    Never dumps the whole store — only the fields relevant to the task at hand."""

    def __init__(self, store):
        self.store = store

    def build_health_score_context(self, score_data: dict) -> dict:
        return {
            "store_name": self.store.name,
            "score": score_data["score"],
            "level": score_data["level"],
            "breakdown": score_data["breakdown"],
        }

    def build_daily_context(self) -> dict:
        stats = get_dashboard_stats(self.store, days=1)
        stats_30d = get_dashboard_stats(self.store, days=30)
        health = ai_selectors.compute_health_score(self.store)
        anomalies = ai_selectors.detect_anomalies(self.store)
        low_stock = get_low_stock_products(self.store, limit=5)

        return {
            "store_name": self.store.name,
            "today": {
                "orders_count": stats["orders_count"],
                "revenue": str(stats["revenue"]),
            },
            "last_30_days": {
                "orders_count": stats_30d["orders_count"],
                "revenue": str(stats_30d["revenue"]),
                "revenue_growth_pct": stats_30d["revenue_growth_pct"],
            },
            "health_score": health["score"],
            "pending_orders": stats["pending_orders_count"],
            "low_stock_products": [p.name for p in low_stock],
            "anomalies": [a["message"] for a in anomalies],
        }, health, anomalies

    def build_product_context(self, product) -> dict:
        return {
            "name": product.name,
            "description": product.description[:400],
            "price": str(product.price),
            "compare_at_price": str(product.compare_at_price) if product.compare_at_price else None,
            "category": product.category.name if product.category else None,
            "image_count": product.images.count(),
            "stock": product.total_stock,
            "created_days_ago": (product.updated_at - product.created_at).days,
        }

    def build_chat_context(self, question: str) -> dict:
        intents = _detect_intents(question)
        context = {"store_name": self.store.name, "currency": self.store.currency}

        name_match = NAME_AFTER_PREPOSITION.search(question)
        if name_match and ("orders" in intents or "customers" in intents):
            name = name_match.group(1)
            orders = ai_selectors.search_orders_by_customer_name(self.store, name)
            context["matched_customer_name"] = name
            context["matching_orders"] = [
                {
                    "order_number": o.order_number,
                    "status": o.status,
                    "total_amount": str(o.total_amount),
                    "created_at": o.created_at.date().isoformat(),
                }
                for o in orders
            ]
            return context

        if "revenue" in intents or "orders" in intents:
            stats = get_dashboard_stats(self.store, days=30)
            context["last_30_days"] = {
                "orders_count": stats["orders_count"],
                "revenue": str(stats["revenue"]),
                "average_order_value": str(stats["average_order_value"]),
                "revenue_growth_pct": stats["revenue_growth_pct"],
                "pending_orders": stats["pending_orders_count"],
            }
            context["top_products"] = [
                {"name": p["product_name"], "units_sold": p["units_sold"]} for p in get_top_products(self.store, limit=5)
            ]

        if "products" in intents:
            low_stock = get_low_stock_products(self.store, limit=8)
            context["low_stock_products"] = [{"name": p.name, "stock": p.total_stock} for p in low_stock]
            context["total_active_products"] = get_products_for_store(self.store).filter(status="active").count()

        if "customers" in intents:
            top_customers = get_customers_for_store(self.store).order_by("-total_spent")[:5]
            context["top_customers"] = [
                {"name": c.full_name, "orders": c.order_count, "total_spent": str(c.total_spent or 0)}
                for c in top_customers
            ]

        if context == {"store_name": self.store.name, "currency": self.store.currency}:
            # No intent matched a specific data slice — fall back to a compact general snapshot.
            stats = get_dashboard_stats(self.store, days=30)
            context["last_30_days_summary"] = {
                "orders_count": stats["orders_count"],
                "revenue": str(stats["revenue"]),
                "customers_count": stats["customers_count"],
                "products_count": stats["products_count"],
            }

        return context


class BuyerContextBuilder:
    """Public-data-only context for the storefront's Comy widget. Never includes
    anything from the merchant's private dashboard (revenue, customers, etc.)."""

    def __init__(self, store):
        self.store = store

    def build_catalog_context(self, question: str) -> dict:
        products_qs = get_products_for_store(self.store).filter(status="active")

        keywords = [w for w in re.findall(r"\w{3,}", question.lower())]
        matched = products_qs
        if keywords:
            from django.db.models import Q

            query = Q()
            for word in keywords[:5]:
                query |= Q(name__icontains=word) | Q(description__icontains=word)
            matched = products_qs.filter(query)

        products = list(matched[:8]) or list(products_qs.order_by("-created_at")[:8])

        return {
            "store_name": self.store.name,
            "store_description": self.store.description[:300],
            "currency": self.store.currency,
            "categories": [c.name for c in get_categories_with_active_products(self.store)],
            "products": [
                {
                    "name": p.name,
                    "price": str(p.price),
                    "compare_at_price": str(p.compare_at_price) if p.compare_at_price else None,
                    "in_stock": not p.is_out_of_stock,
                    "category": p.category.name if p.category else None,
                }
                for p in products
            ],
        }
