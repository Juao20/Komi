from django.db.models import Count, Q, Sum

from apps.customers.models import Customer


def get_customers_for_store(store):
    return Customer.objects.filter(store=store).annotate(
        order_count=Count("orders", distinct=True),
        total_spent=Sum("orders__total_amount", filter=~Q(orders__status="cancelled")),
    )


def get_customer_by_public_id(store, public_id):
    return get_customers_for_store(store).filter(public_id=public_id).first()
