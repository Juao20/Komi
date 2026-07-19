from rest_framework import serializers

from apps.payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "public_id",
            "provider",
            "payment_reference",
            "amount",
            "currency",
            "status",
            "payment_method",
            "checkout_url",
            "paid_at",
            "created_at",
        )


class InitiatePaymentSerializer(serializers.Serializer):
    return_url = serializers.URLField()
    provider = serializers.ChoiceField(choices=["fedapay"], required=False, default="fedapay")
