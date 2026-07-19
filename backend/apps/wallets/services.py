import uuid

from django.db import transaction
from django.utils import timezone

from apps.core.exceptions import ServiceError
from apps.wallets.choices import WalletTransactionStatus, WalletTransactionType, WithdrawalStatus
from apps.wallets.models import Wallet, WalletTransaction, Withdrawal


def get_or_create_wallet(store):
    wallet, _ = Wallet.objects.get_or_create(store=store, defaults={"currency": store.currency})
    return wallet


def _ref(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"


@transaction.atomic
def credit_wallet(*, store, amount, transaction_type, reference=None, description="", payment=None, order=None):
    wallet = get_or_create_wallet(store)
    wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

    wallet.available_balance += amount
    if transaction_type == WalletTransactionType.PAYMENT_RECEIVED:
        wallet.total_earned += amount
    wallet.save(update_fields=["available_balance", "total_earned", "updated_at"])

    return WalletTransaction.objects.create(
        wallet=wallet,
        type=transaction_type,
        status=WalletTransactionStatus.COMPLETED,
        amount=amount,
        balance_after=wallet.available_balance,
        reference=reference or _ref("WTX"),
        description=description,
        payment=payment,
        order=order,
    )


@transaction.atomic
def debit_wallet(*, store, amount, transaction_type, reference=None, description="", payment=None, order=None):
    wallet = get_or_create_wallet(store)
    wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

    wallet.available_balance -= amount
    wallet.save(update_fields=["available_balance", "updated_at"])

    return WalletTransaction.objects.create(
        wallet=wallet,
        type=transaction_type,
        status=WalletTransactionStatus.COMPLETED,
        amount=-amount,
        balance_after=wallet.available_balance,
        reference=reference or _ref("WTX"),
        description=description,
        payment=payment,
        order=order,
    )


def credit_wallet_for_payment(*, payment):
    if WalletTransaction.objects.filter(payment=payment, type=WalletTransactionType.PAYMENT_RECEIVED).exists():
        return None

    return credit_wallet(
        store=payment.store,
        amount=payment.amount,
        transaction_type=WalletTransactionType.PAYMENT_RECEIVED,
        reference=f"PAY-{payment.payment_reference}",
        description=f"Paiement pour la commande #{payment.order.order_number}",
        payment=payment,
        order=payment.order,
    )


def reverse_wallet_for_cancelled_order(*, order):
    from apps.payments.choices import PaymentStatus as GatewayPaymentStatus
    from apps.payments.models import Payment

    payment = Payment.objects.filter(order=order, status=GatewayPaymentStatus.SUCCESSFUL).order_by("-created_at").first()
    if payment is None:
        return None

    if WalletTransaction.objects.filter(order=order, type=WalletTransactionType.ORDER_CANCELLED).exists():
        return None

    return debit_wallet(
        store=order.store,
        amount=payment.amount,
        transaction_type=WalletTransactionType.ORDER_CANCELLED,
        description=f"Commande #{order.order_number} annulée après paiement",
        payment=payment,
        order=order,
    )


@transaction.atomic
def request_withdrawal(*, store, amount, method, mobile_number, account_holder_name):
    if amount <= 0:
        raise ServiceError("Withdrawal amount must be positive.", code="invalid_amount")

    wallet = get_or_create_wallet(store)
    wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

    if amount > wallet.available_balance:
        raise ServiceError("Insufficient available balance.", code="insufficient_balance")

    reference = _ref("WD")

    withdrawal = Withdrawal.objects.create(
        store=store,
        wallet=wallet,
        amount=amount,
        currency=wallet.currency,
        method=method,
        mobile_number=mobile_number,
        account_holder_name=account_holder_name,
        status=WithdrawalStatus.PENDING,
        reference=reference,
    )

    wallet.available_balance -= amount
    wallet.pending_balance += amount
    wallet.save(update_fields=["available_balance", "pending_balance", "updated_at"])

    WalletTransaction.objects.create(
        wallet=wallet,
        type=WalletTransactionType.WITHDRAWAL_REQUESTED,
        status=WalletTransactionStatus.PENDING,
        amount=-amount,
        balance_after=wallet.available_balance,
        reference=reference,
        description=f"Demande de retrait via {withdrawal.get_method_display()}",
        withdrawal=withdrawal,
    )

    from apps.notifications.services import notify_store

    notify_store(
        store=store,
        category="system",
        title="Retrait demandé",
        message=f"Une demande de retrait de {amount} {wallet.currency} a été soumise.",
    )

    return withdrawal


@transaction.atomic
def approve_withdrawal(*, withdrawal, admin_user=None):
    if withdrawal.status != WithdrawalStatus.PENDING:
        raise ServiceError("This withdrawal has already been processed.", code="already_processed")

    wallet = Wallet.objects.select_for_update().get(pk=withdrawal.wallet_id)
    wallet.pending_balance -= withdrawal.amount
    wallet.total_withdrawn += withdrawal.amount
    wallet.save(update_fields=["pending_balance", "total_withdrawn", "updated_at"])

    withdrawal.status = WithdrawalStatus.APPROVED
    withdrawal.processed_at = timezone.now()
    withdrawal.processed_by = admin_user
    withdrawal.save(update_fields=["status", "processed_at", "processed_by", "updated_at"])

    WalletTransaction.objects.create(
        wallet=wallet,
        type=WalletTransactionType.WITHDRAWAL_APPROVED,
        status=WalletTransactionStatus.COMPLETED,
        amount=0,
        balance_after=wallet.available_balance,
        reference=f"{withdrawal.reference}-OK",
        description="Retrait validé et envoyé.",
        withdrawal=withdrawal,
    )

    from apps.notifications.services import notify_store

    notify_store(
        store=withdrawal.store,
        category="system",
        title="Retrait validé",
        message=f"Votre retrait de {withdrawal.amount} {withdrawal.currency} a été envoyé.",
    )

    return withdrawal


@transaction.atomic
def reject_withdrawal(*, withdrawal, reason="", admin_user=None):
    if withdrawal.status != WithdrawalStatus.PENDING:
        raise ServiceError("This withdrawal has already been processed.", code="already_processed")

    wallet = Wallet.objects.select_for_update().get(pk=withdrawal.wallet_id)
    wallet.pending_balance -= withdrawal.amount
    wallet.available_balance += withdrawal.amount
    wallet.save(update_fields=["pending_balance", "available_balance", "updated_at"])

    withdrawal.status = WithdrawalStatus.REJECTED
    withdrawal.admin_note = reason
    withdrawal.processed_at = timezone.now()
    withdrawal.processed_by = admin_user
    withdrawal.save(update_fields=["status", "admin_note", "processed_at", "processed_by", "updated_at"])

    WalletTransaction.objects.create(
        wallet=wallet,
        type=WalletTransactionType.WITHDRAWAL_REJECTED,
        status=WalletTransactionStatus.COMPLETED,
        amount=withdrawal.amount,
        balance_after=wallet.available_balance,
        reference=f"{withdrawal.reference}-REJECTED",
        description=reason or "Retrait refusé.",
        withdrawal=withdrawal,
    )

    from apps.notifications.services import notify_store

    notify_store(
        store=withdrawal.store,
        category="system",
        title="Retrait refusé",
        message=reason or "Votre demande de retrait a été refusée.",
    )

    return withdrawal
