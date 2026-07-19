from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.wallets.choices import (
    WalletTransactionStatus,
    WalletTransactionType,
    WithdrawalMethod,
    WithdrawalStatus,
)


class Wallet(BaseModel):
    store = models.OneToOneField("stores.Store", on_delete=models.CASCADE, related_name="wallet")
    currency = models.CharField(max_length=3, default="XOF")

    available_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    pending_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_earned = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_withdrawn = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        db_table = "wallets_wallet"

    def __str__(self):
        return f"Wallet · {self.store.name}"


class Withdrawal(BaseModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="withdrawals")
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="withdrawals")

    amount = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=3, default="XOF")
    method = models.CharField(max_length=20, choices=WithdrawalMethod.choices)
    mobile_number = models.CharField(max_length=32)
    account_holder_name = models.CharField(max_length=150)

    status = models.CharField(max_length=16, choices=WithdrawalStatus.choices, default=WithdrawalStatus.PENDING)
    reference = models.CharField(max_length=64, unique=True, db_index=True)
    admin_note = models.CharField(max_length=255, blank=True)

    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    class Meta:
        db_table = "wallets_withdrawal"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["store", "status"])]

    def __str__(self):
        return f"{self.reference} — {self.amount} {self.currency}"


class WalletTransaction(BaseModel):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")

    type = models.CharField(max_length=32, choices=WalletTransactionType.choices)
    status = models.CharField(
        max_length=16, choices=WalletTransactionStatus.choices, default=WalletTransactionStatus.COMPLETED
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2, help_text="Signed: positive credits, negative debits.")
    balance_after = models.DecimalField(max_digits=14, decimal_places=2)
    reference = models.CharField(max_length=64, unique=True, db_index=True)
    description = models.CharField(max_length=255, blank=True)

    payment = models.ForeignKey(
        "payments.Payment", on_delete=models.SET_NULL, null=True, blank=True, related_name="wallet_transactions"
    )
    order = models.ForeignKey(
        "orders.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="wallet_transactions"
    )
    withdrawal = models.ForeignKey(
        Withdrawal, on_delete=models.SET_NULL, null=True, blank=True, related_name="wallet_transactions"
    )

    class Meta:
        db_table = "wallets_transaction"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["wallet", "type"])]

    def __str__(self):
        return f"{self.reference} ({self.amount})"
