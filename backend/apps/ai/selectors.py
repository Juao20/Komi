from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from apps.customers.models import Customer
from apps.orders.choices import OrderStatus
from apps.orders.models import Order
from apps.products.models import Product


def compute_health_score(store) -> dict:
    """Pure Django scoring — no LLM call. Weighted components sum to 100."""
    breakdown = []

    def add(label, points, max_points):
        breakdown.append({"label": label, "points": points, "max": max_points})

    # Boutique setup (30 pts)
    add("Boutique publiée", 15 if store.is_published else 0, 15)
    add("Logo ajouté", 8 if store.logo_url else 0, 8)
    add("Description renseignée", 7 if store.description else 0, 7)

    # Catalogue (25 pts)
    active_products = Product.objects.filter(store=store, status="active")
    product_count = active_products.count()
    product_points = min(20, product_count * 4)
    add("Produits actifs", product_points, 20)

    out_of_stock = sum(1 for p in active_products if p.track_inventory and p.total_stock <= 0)
    stock_ratio_ok = product_count == 0 or (out_of_stock / product_count) < 0.2
    add("Stock globalement disponible", 5 if stock_ratio_ok else 0, 5)

    # Activity (30 pts)
    since_30d = timezone.now() - timedelta(days=30)
    recent_orders = Order.objects.filter(store=store, created_at__gte=since_30d)
    recent_orders_count = recent_orders.count()
    add("Commandes actives (30j)", min(15, recent_orders_count * 3), 15)

    pending_over_48h = Order.objects.filter(
        store=store, status=OrderStatus.PENDING, created_at__lte=timezone.now() - timedelta(hours=48)
    ).count()
    add("Commandes traitées rapidement", 15 if pending_over_48h == 0 else max(0, 15 - pending_over_48h * 5), 15)

    # Customers (15 pts)
    repeat_customers = Customer.objects.filter(store=store, orders__isnull=False).distinct().count()
    add("Clients actifs", min(15, repeat_customers * 3), 15)

    score = sum(item["points"] for item in breakdown)
    if score >= 80:
        level = "excellent"
    elif score >= 55:
        level = "good"
    else:
        level = "needs_attention"

    return {"score": score, "level": level, "breakdown": breakdown}


def detect_anomalies(store) -> list[dict]:
    """Pure Django anomaly detection — no LLM call."""
    anomalies = []
    now = timezone.now()

    # Revenue drop vs previous 30-day window
    current_start = now - timedelta(days=30)
    previous_start = now - timedelta(days=60)
    current_revenue = _revenue_between(store, current_start, now)
    previous_revenue = _revenue_between(store, previous_start, current_start)
    if previous_revenue > 0:
        change = (current_revenue - previous_revenue) / previous_revenue * 100
        if change <= -30:
            anomalies.append(
                {
                    "type": "revenue_drop",
                    "severity": "warning",
                    "message": f"Chiffre d'affaires en baisse de {abs(round(change))}% sur 30 jours.",
                }
            )

    # Best-seller now out of stock
    from apps.analytics.selectors import get_top_products

    for product_row in get_top_products(store, limit=3, days=60):
        product = Product.objects.filter(store=store, pk=product_row["product_id"]).first()
        if product and product.track_inventory and product.total_stock <= 0:
            anomalies.append(
                {
                    "type": "bestseller_out_of_stock",
                    "severity": "critical",
                    "message": f"« {product.name} » est un de vos best-sellers mais est en rupture de stock.",
                }
            )

    # High cancellation rate
    recent_orders = Order.objects.filter(store=store, created_at__gte=now - timedelta(days=30))
    total_recent = recent_orders.count()
    cancelled_recent = recent_orders.filter(status=OrderStatus.CANCELLED).count()
    if total_recent >= 5 and cancelled_recent / total_recent >= 0.3:
        anomalies.append(
            {
                "type": "high_cancellation_rate",
                "severity": "warning",
                "message": f"{round(cancelled_recent / total_recent * 100)}% des commandes des 30 derniers jours ont été annulées.",
            }
        )

    # Products never sold after 30+ days live
    never_sold = Product.objects.filter(
        store=store, status="active", created_at__lte=now - timedelta(days=30), order_items__isnull=True
    ).distinct()
    if never_sold.exists():
        anomalies.append(
            {
                "type": "products_never_sold",
                "severity": "info",
                "message": f"{never_sold.count()} produit(s) n'ont jamais été vendus depuis plus de 30 jours.",
            }
        )

    return anomalies


def _revenue_between(store, start, end) -> Decimal:
    from django.db.models import Sum

    total = (
        Order.objects.filter(store=store, created_at__gte=start, created_at__lt=end)
        .exclude(status=OrderStatus.CANCELLED)
        .aggregate(total=Sum("total_amount"))["total"]
    )
    return total or Decimal("0")


def search_orders_by_customer_name(store, name_fragment):
    return Order.objects.filter(store=store, customer_name__icontains=name_fragment).select_related("customer")[:10]
