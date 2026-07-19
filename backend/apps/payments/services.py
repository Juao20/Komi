import uuid

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.core.exceptions import ServiceError
from apps.orders.choices import OrderStatus
from apps.orders.services import mark_order_paid, mark_order_payment_failed
from apps.payments import selectors
from apps.payments.choices import TERMINAL_STATUSES, PaymentProvider, PaymentStatus
from apps.payments.models import Payment, PaymentEvent
from apps.payments.providers.registry import get_provider


def _generate_payment_reference() -> str:
    return f"KOMI-{uuid.uuid4().hex[:16].upper()}"


def _assert_order_payable(order):
    if order.status == OrderStatus.CANCELLED:
        raise ServiceError("This order has been cancelled and can no longer be paid.", code="order_cancelled")
    if order.payment_status == "paid":
        raise ServiceError("This order has already been paid.", code="already_paid")


@transaction.atomic
def create_payment_for_order(*, order, return_url, provider=PaymentProvider.FEDAPAY):
    """Initiates an online payment for `order`.

    The amount is always recomputed from the order itself — a client can
    never influence what gets charged.
    """
    _assert_order_payable(order)

    existing = selectors.get_latest_payment_for_order(order)
    if existing and existing.status in (PaymentStatus.PENDING, PaymentStatus.PROCESSING) and existing.checkout_url:
        return existing

    payment = Payment.objects.create(
        order=order,
        store=order.store,
        customer=order.customer,
        provider=provider,
        payment_reference=_generate_payment_reference(),
        amount=order.total_amount,
        currency=order.currency,
        status=PaymentStatus.PENDING,
    )

    provider_service = get_provider(provider)
    callback_url = f"{settings.BACKEND_URL}/api/v1/payments/webhook/{provider}/"

    result = provider_service.create_transaction(payment=payment, callback_url=callback_url, return_url=return_url)

    payment.transaction_id = result.transaction_id
    payment.checkout_url = result.checkout_url
    payment.status = PaymentStatus.PROCESSING
    payment.metadata = {"provider_transaction": result.raw}
    payment.save(update_fields=["transaction_id", "checkout_url", "status", "metadata", "updated_at"])

    return payment


def get_payment_status(*, order):
    payment = selectors.get_latest_payment_for_order(order)
    return payment


@transaction.atomic
def process_webhook(*, provider, payload: bytes, headers: dict):
    provider_service = get_provider(provider)

    if not provider_service.verify_webhook_signature(payload=payload, headers=headers):
        raise ServiceError("Invalid webhook signature.", code="invalid_signature", status_code=401)

    event = provider_service.parse_webhook_event(payload=payload, headers=headers)

    payment = selectors.get_payment_by_transaction_id(event.transaction_id)
    if payment is None:
        return None

    PaymentEvent.objects.create(payment=payment, provider=provider, event_type=event.event_type, raw_payload=event.raw)

    # The webhook is the source of truth, but we re-fetch the transaction
    # from the provider rather than trusting the webhook body's amount/status
    # verbatim — defends against a forged payload slipping past signature
    # checks due to a leaked or misconfigured secret.
    verification = provider_service.verify_transaction(payment.transaction_id)

    _apply_verification(payment=payment, verification=verification)

    return payment


@transaction.atomic
def sync_payment_from_provider(*, payment):
    """Manual/poll fallback: re-checks a payment's status directly with the provider."""
    provider_service = get_provider(payment.provider)
    verification = provider_service.verify_transaction(payment.transaction_id)
    _apply_verification(payment=payment, verification=verification)
    return payment


def _apply_verification(*, payment, verification):
    if payment.status == verification.status:
        return payment

    if payment.status in TERMINAL_STATUSES:
        return payment

    if verification.amount and verification.amount != payment.amount:
        payment.failure_reason = "Amount mismatch with provider."
        payment.status = PaymentStatus.FAILED
        payment.save(update_fields=["status", "failure_reason", "updated_at"])
        mark_order_payment_failed(order=payment.order)
        return payment

    payment.status = verification.status
    if verification.payment_method:
        payment.payment_method = verification.payment_method
    if verification.status == PaymentStatus.SUCCESSFUL:
        payment.paid_at = timezone.now()
    payment.save(update_fields=["status", "payment_method", "paid_at", "updated_at"])

    if verification.status == PaymentStatus.SUCCESSFUL:
        mark_order_paid(order=payment.order)

        from apps.wallets.services import credit_wallet_for_payment

        credit_wallet_for_payment(payment=payment)
    elif verification.status in (PaymentStatus.FAILED, PaymentStatus.CANCELLED):
        mark_order_payment_failed(order=payment.order)

    return payment
