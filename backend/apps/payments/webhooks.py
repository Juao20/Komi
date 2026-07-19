import logging

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import ServiceError
from apps.payments import services

logger = logging.getLogger(__name__)


class ProviderWebhookView(APIView):
    """Single entrypoint for all payment provider webhooks: /payments/webhook/<provider>/

    The webhook is the only source of truth for payment confirmation —
    the frontend return-URL flow never finalizes a payment on its own.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, provider):
        try:
            services.process_webhook(provider=provider, payload=request.body, headers=request.headers)
        except ServiceError as exc:
            logger.warning("Webhook rejected for provider=%s: %s", provider, exc.message)
            return Response({"detail": exc.message}, status=exc.status_code)
        except ValueError:
            return Response({"detail": "Unknown provider."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"received": True})
