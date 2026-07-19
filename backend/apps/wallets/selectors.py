from django.db.models import Sum
from django.utils import timezone

from apps.wallets.choices import WalletTransactionType
from apps.wallets.models import Wallet, WalletTransaction, Withdrawal


def get_wallet_for_store(store):
    return Wallet.objects.filter(store=store).first()


def get_wallet_transactions(wallet):
    return WalletTransaction.objects.filter(wallet=wallet).select_related("payment", "order", "withdrawal")


def get_withdrawals_for_store(store):
    return Withdrawal.objects.filter(store=store).select_related("wallet")


def get_monthly_revenue(wallet):
    start_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total = WalletTransaction.objects.filter(
        wallet=wallet, type=WalletTransactionType.PAYMENT_RECEIVED, created_at__gte=start_of_month
    ).aggregate(total=Sum("amount"))["total"]
    return total or 0
