from apps.orders.models import Order


def get_orders_for_store(store):
    return (
        Order.objects.filter(store=store)
        .select_related("customer", "coupon")
        .prefetch_related("items")
    )


def get_order_by_public_id(store, public_id):
    return (
        get_orders_for_store(store)
        .prefetch_related("status_history", "comments__author")
        .filter(public_id=public_id)
        .first()
    )


def get_order_by_public_id_unscoped(public_id):
    """Looks up an order by its (unguessable) UUID with no store scoping.

    Used by the payment flow, where the caller is a guest customer
    identified only by the order reference they were handed at checkout.
    """
    return Order.objects.select_related("store", "customer").filter(public_id=public_id).first()
