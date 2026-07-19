from datetime import timedelta
from decimal import Decimal

from django.db.models import Avg, Count, DecimalField, F, Q, Sum
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone

from apps.customers.models import Customer
from apps.orders.choices import OrderStatus
from apps.orders.models import Order, OrderItem
from apps.products.models import Product

NON_CANCELLED = ~Q(status=OrderStatus.CANCELLED)


def _period_bounds(days):
    end = timezone.now()
    start = end - timedelta(days=days)
    previous_start = start - timedelta(days=days)
    return previous_start, start, end


def get_dashboard_stats(store, days=30):
    previous_start, start, end = _period_bounds(days)

    current_orders = Order.objects.filter(store=store, created_at__gte=start, created_at__lte=end)
    previous_orders = Order.objects.filter(store=store, created_at__gte=previous_start, created_at__lt=start)

    current_revenue = current_orders.filter(NON_CANCELLED).aggregate(
        total=Coalesce(Sum("total_amount"), Decimal("0"), output_field=DecimalField())
    )["total"]
    previous_revenue = previous_orders.filter(NON_CANCELLED).aggregate(
        total=Coalesce(Sum("total_amount"), Decimal("0"), output_field=DecimalField())
    )["total"]

    current_orders_count = current_orders.count()
    previous_orders_count = previous_orders.count()

    average_order_value = current_orders.filter(NON_CANCELLED).aggregate(
        avg=Coalesce(Avg("total_amount"), Decimal("0"), output_field=DecimalField())
    )["avg"]

    return {
        "revenue": current_revenue,
        "revenue_growth_pct": _growth_pct(current_revenue, previous_revenue),
        "orders_count": current_orders_count,
        "orders_growth_pct": _growth_pct(current_orders_count, previous_orders_count),
        "customers_count": Customer.objects.filter(store=store).count(),
        "products_count": Product.objects.filter(store=store).count(),
        "average_order_value": average_order_value,
        "pending_orders_count": Order.objects.filter(store=store, status=OrderStatus.PENDING).count(),
    }


def _growth_pct(current, previous):
    if not previous:
        return 100.0 if current else 0.0
    return round((float(current) - float(previous)) / float(previous) * 100, 1)


def get_sales_over_time(store, days=30):
    start = timezone.now() - timedelta(days=days)
    rows = (
        Order.objects.filter(store=store, created_at__gte=start)
        .filter(NON_CANCELLED)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(orders_count=Count("id"), revenue=Sum("total_amount"))
        .order_by("day")
    )
    return list(rows)


def get_top_products(store, limit=5, days=30):
    start = timezone.now() - timedelta(days=days)
    rows = (
        OrderItem.objects.filter(order__store=store, order__created_at__gte=start)
        .filter(~Q(order__status=OrderStatus.CANCELLED))
        .values("product_id", "product_name")
        .annotate(
            units_sold=Sum("quantity"),
            revenue=Sum(F("unit_price") * F("quantity")),
        )
        .order_by("-revenue")[:limit]
    )
    return list(rows)


def get_order_status_breakdown(store):
    rows = Order.objects.filter(store=store).values("status").annotate(count=Count("id"))
    return {row["status"]: row["count"] for row in rows}


def get_recent_orders(store, limit=5):
    return Order.objects.filter(store=store).select_related("customer").order_by("-created_at")[:limit]


def get_best_customers(store, limit=5):
    orders_not_cancelled = ~Q(orders__status=OrderStatus.CANCELLED)
    return (
        Customer.objects.filter(store=store)
        .annotate(
            order_count=Count("orders", filter=orders_not_cancelled, distinct=True),
            total_spent=Coalesce(
                Sum("orders__total_amount", filter=orders_not_cancelled), Decimal("0"), output_field=DecimalField()
            ),
        )
        .order_by("-total_spent")[:limit]
    )
