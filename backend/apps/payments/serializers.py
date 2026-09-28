from urllib.parse import urlparse

from django.conf import settings
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


def _allowed_return_hosts():
    urls = [settings.FRONTEND_URL, *settings.CORS_ALLOWED_ORIGINS]
    return {urlparse(url).netloc.lower() for url in urls if url}


class InitiatePaymentSerializer(serializers.Serializer):
    return_url = serializers.URLField()
    provider = serializers.ChoiceField(choices=["fedapay"], required=False, default="fedapay")

    def validate_return_url(self, value):
        # The provider redirects the buyer here after paying: only our own
        # frontend is accepted, otherwise this would be an open redirect.
        if urlparse(value).netloc.lower() not in _allowed_return_hosts():
            raise serializers.ValidationError("Return URL must point to the KOMI storefront.")
        return value
