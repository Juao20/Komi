from datetime import timedelta

from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.backoffice.constants import PLAN_PRICES

# Rough Groq llama-3.1-8b-instant blended price, used only to give the admin an
# order-of-magnitude cost estimate — not a billing-accurate figure.
GROQ_ESTIMATED_USD_PER_MILLION_TOKENS = 0.05


def _date_range(days):
    date_to = timezone.localdate()
    date_from = date_to - timedelta(days=days - 1)
    return date_from, date_to


def compute_mrr():
    from apps.stores.models import Store

    total = 0
    for row in Store.objects.values("plan").annotate(n=Count("id")):
        total += PLAN_PRICES.get(row["plan"], 0) * row["n"]
    return total


def get_dashboard_kpis():
    from apps.orders.choices import PaymentStatus
    from apps.orders.models import Order
    from apps.stores.choices import StoreStatus
    from apps.stores.models import Store
    from apps.accounts.models import User
    from apps.wallets.choices import WithdrawalStatus
    from apps.wallets.models import Withdrawal

    today = timezone.localdate()
    week_ago = today - timedelta(days=7)
    month_start = today.replace(day=1)

    paid_orders = Order.objects.filter(payment_status=PaymentStatus.PAID)
    paid_count = paid_orders.count()
    gmv_total = paid_orders.aggregate(total=Sum("total_amount"))["total"] or 0
    gmv_this_month = (
        paid_orders.filter(created_at__date__gte=month_start).aggregate(total=Sum("total_amount"))["total"] or 0
    )
    revenue_today = paid_orders.filter(created_at__date=today).aggregate(total=Sum("total_amount"))["total"] or 0
    aov = round(gmv_total / paid_count, 2) if paid_count else 0

    mrr = compute_mrr()

    return {
        "total_stores": Store.objects.count(),
        "published_stores": Store.objects.filter(status=StoreStatus.PUBLISHED).count(),
        "new_stores_this_week": Store.objects.filter(created_at__date__gte=week_ago).count(),
        "total_users": User.objects.count(),
        "new_users_this_week": User.objects.filter(created_at__date__gte=week_ago).count(),
        "total_orders": Order.objects.count(),
        "orders_today": Order.objects.filter(created_at__date=today).count(),
        "gmv_total": gmv_total,
        "gmv_this_month": gmv_this_month,
        "revenue_today": revenue_today,
        "aov": aov,
        "mrr": mrr,
        "arr": mrr * 12,
        "pending_withdrawals": Withdrawal.objects.filter(status=WithdrawalStatus.PENDING).count(),
    }


def get_analytics(days=30):
    from apps.accounts.models import User
    from apps.orders.choices import PaymentStatus
    from apps.orders.models import Order
    from apps.stores.models import Store

    date_from, date_to = _date_range(days)
    now = timezone.now()

    orders_qs = Order.objects.filter(created_at__date__gte=date_from, created_at__date__lte=date_to)
    orders_series = list(
        orders_qs.annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(orders=Count("id"), gmv=Sum("total_amount", filter=Q(payment_status=PaymentStatus.PAID)))
        .order_by("day")
    )

    signups_series = list(
        User.objects.filter(created_at__date__gte=date_from, created_at__date__lte=date_to)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(signups=Count("id"))
        .order_by("day")
    )

    total_orders = orders_qs.count()
    paid_orders = orders_qs.filter(payment_status=PaymentStatus.PAID).count()
    conversion_rate = round(paid_orders / total_orders * 100, 1) if total_orders else 0

    retention_cutoff = now - timedelta(days=30)
    eligible_stores = Store.objects.filter(created_at__lt=retention_cutoff)
    eligible_count = eligible_stores.count()
    retained_count = (
        eligible_stores.filter(orders__created_at__gte=retention_cutoff).distinct().count() if eligible_count else 0
    )
    retention_rate = round(retained_count / eligible_count * 100, 1) if eligible_count else 0

    return {
        "date_from": date_from,
        "date_to": date_to,
        "orders_series": orders_series,
        "signups_series": signups_series,
        "dau": User.objects.filter(last_login__gte=now - timedelta(days=1)).count(),
        "wau": User.objects.filter(last_login__gte=now - timedelta(days=7)).count(),
        "mau": User.objects.filter(last_login__gte=now - timedelta(days=30)).count(),
        "conversion_rate": conversion_rate,
        "retention_rate": retention_rate,
    }


def get_stores_queryset(search=None, status=None, plan=None):
    from apps.stores.models import Store

    qs = Store.objects.select_related("owner").annotate(
        orders_count=Count("orders", distinct=True),
        products_count=Count("products", distinct=True),
    )
    if search:
        qs = qs.filter(Q(name__icontains=search) | Q(owner__email__icontains=search) | Q(slug__icontains=search))
    if status:
        qs = qs.filter(status=status)
    if plan:
        qs = qs.filter(plan=plan)
    return qs


def get_store_by_public_id(public_id):
    from apps.stores.models import Store

    return Store.objects.filter(public_id=public_id).first()


def get_users_queryset(search=None, is_active=None):
    from apps.accounts.models import User

    qs = User.objects.select_related("store")
    if search:
        qs = qs.filter(Q(email__icontains=search) | Q(full_name__icontains=search))
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    return qs


def get_user_by_public_id(public_id):
    from apps.accounts.models import User

    return User.objects.filter(public_id=public_id).first()


def get_orders_queryset(search=None, status=None, payment_status=None):
    from apps.orders.models import Order

    qs = Order.objects.select_related("store", "customer")
    if search:
        qs = qs.filter(Q(order_number__icontains=search) | Q(store__name__icontains=search) | Q(customer_name__icontains=search))
    if status:
        qs = qs.filter(status=status)
    if payment_status:
        qs = qs.filter(payment_status=payment_status)
    return qs


def get_payments_queryset(search=None, status=None, provider=None):
    from apps.payments.models import Payment

    qs = Payment.objects.select_related("store", "order")
    if search:
        qs = qs.filter(Q(payment_reference__icontains=search) | Q(store__name__icontains=search))
    if status:
        qs = qs.filter(status=status)
    if provider:
        qs = qs.filter(provider=provider)
    return qs


def get_products_queryset(search=None, status=None, store_id=None):
    from apps.products.models import Product

    qs = Product.all_objects.select_related("store")
    if search:
        qs = qs.filter(Q(name__icontains=search) | Q(store__name__icontains=search) | Q(sku__icontains=search))
    if status:
        qs = qs.filter(status=status)
    if store_id:
        qs = qs.filter(store_id=store_id)
    return qs


def get_subscriptions_breakdown():
    from apps.stores.models import Store

    rows = list(Store.objects.values("plan").annotate(count=Count("id")).order_by("plan"))
    breakdown = []
    for row in rows:
        price = PLAN_PRICES.get(row["plan"], 0)
        breakdown.append({"plan": row["plan"], "count": row["count"], "price": price, "mrr": price * row["count"]})
    return breakdown


def get_comy_usage_stats(days=30):
    from apps.ai.models import AIUsageLog

    date_from, date_to = _date_range(days)
    qs = AIUsageLog.objects.filter(created_at__date__gte=date_from, created_at__date__lte=date_to)

    total_calls = qs.count()
    cache_hits = qs.filter(cache_hit=True).count()
    total_tokens = qs.aggregate(t=Sum("tokens_used"))["t"] or 0
    avg_duration = qs.aggregate(a=Avg("duration_ms"))["a"] or 0
    failed_calls = qs.filter(success=False).count()
    by_feature = list(qs.values("feature").annotate(calls=Count("id"), tokens=Sum("tokens_used")).order_by("-calls"))

    daily_series = list(
        qs.annotate(day=TruncDate("created_at")).values("day").annotate(calls=Count("id"), tokens=Sum("tokens_used")).order_by("day")
    )

    return {
        "date_from": date_from,
        "date_to": date_to,
        "total_calls": total_calls,
        "cache_hit_rate": round(cache_hits / total_calls * 100, 1) if total_calls else 0,
        "total_tokens": total_tokens,
        "avg_duration_ms": round(avg_duration, 1) if avg_duration else 0,
        "failed_calls": failed_calls,
        "estimated_cost_usd": round((total_tokens / 1_000_000) * GROQ_ESTIMATED_USD_PER_MILLION_TOKENS, 4),
        "by_feature": by_feature,
        "daily_series": daily_series,
    }


def get_reports_queryset(status=None):
    from apps.products.models import ProductReport

    qs = ProductReport.objects.select_related("product", "product__store")
    if status:
        qs = qs.filter(status=status)
    return qs


def get_report_by_public_id(public_id):
    from apps.products.models import ProductReport

    return ProductReport.objects.filter(public_id=public_id).first()


def get_system_logs_queryset(level=None):
    from apps.backoffice.models import SystemLog

    qs = SystemLog.objects.all()
    if level:
        qs = qs.filter(level=level)
    return qs


def get_email_logs_queryset(status=None):
    from apps.emails.models import EmailLog

    qs = EmailLog.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_email_stats():
    from apps.emails.models import EmailLog, EmailLogStatus

    qs = EmailLog.objects.all()
    return {
        "total": qs.count(),
        "sent": qs.filter(status=EmailLogStatus.SENT).count(),
        "failed": qs.filter(status=EmailLogStatus.FAILED).count(),
        "queued": qs.filter(status=EmailLogStatus.QUEUED).count(),
    }


def get_platform_settings():
    from django.conf import settings as dj_settings

    return {
        "ai_provider": dj_settings.AI_PROVIDER,
        "email_provider": dj_settings.EMAIL_PROVIDER,
        "payment_provider": "fedapay",
        "fedapay_environment": dj_settings.FEDAPAY_ENVIRONMENT,
        "store_domain_suffix": dj_settings.STORE_DOMAIN_SUFFIX,
        "plan_prices": {plan.value: price for plan, price in PLAN_PRICES.items()},
    }
