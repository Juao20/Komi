from apps.payments.models import Payment


def get_payment_by_public_id(public_id):
    return Payment.objects.select_related("order", "store").filter(public_id=public_id).first()


def get_payment_by_transaction_id(transaction_id):
    return Payment.objects.select_related("order", "store").filter(transaction_id=transaction_id).first()


def get_latest_payment_for_order(order):
    return Payment.objects.filter(order=order).order_by("-created_at").first()


def get_payments_for_store(store):
    return Payment.objects.filter(store=store).select_related("order", "customer")
