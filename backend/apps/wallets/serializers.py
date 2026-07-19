from decimal import Decimal

from rest_framework import serializers

from apps.wallets.models import Wallet, WalletTransaction, Withdrawal


class WalletSerializer(serializers.ModelSerializer):
    monthly_revenue = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Wallet
        fields = (
            "currency",
            "available_balance",
            "pending_balance",
            "total_earned",
            "total_withdrawn",
            "monthly_revenue",
        )


class WalletTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.order_number", read_only=True, default=None)

    class Meta:
        model = WalletTransaction
        fields = ("public_id", "type", "status", "amount", "balance_after", "reference", "description", "order_number", "created_at")


class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = (
            "public_id",
            "amount",
            "currency",
            "method",
            "mobile_number",
            "account_holder_name",
            "status",
            "reference",
            "admin_note",
            "processed_at",
            "created_at",
        )


class RequestWithdrawalSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("1"))
    method = serializers.ChoiceField(choices=["mtn_momo", "moov_money", "celtiis_cash"])
    mobile_number = serializers.CharField(max_length=32)
    account_holder_name = serializers.CharField(max_length=150)
