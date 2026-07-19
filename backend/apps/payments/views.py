from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.selectors import get_order_by_public_id_unscoped
from apps.payments import selectors, services
from apps.payments.serializers import InitiatePaymentSerializer, PaymentSerializer


def _get_order_or_404(order_public_id):
    order = get_order_by_public_id_unscoped(order_public_id)
    if order is None:
        raise NotFound("Order not found.")
    return order


class InitiatePaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, order_public_id):
        order = _get_order_or_404(order_public_id)
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment = services.create_payment_for_order(
            order=order,
            return_url=serializer.validated_data["return_url"],
            provider=serializer.validated_data["provider"],
        )
        return Response(PaymentSerializer(payment).data)


class PaymentStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, order_public_id):
        order = _get_order_or_404(order_public_id)
        payment = selectors.get_latest_payment_for_order(order)
        if payment is None:
            raise NotFound("No payment found for this order.")

        if payment.status == "processing":
            payment = services.sync_payment_from_provider(payment=payment)

        return Response(PaymentSerializer(payment).data)
