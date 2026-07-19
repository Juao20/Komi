from django.urls import path

from apps.payments import views
from apps.payments.webhooks import ProviderWebhookView

urlpatterns = [
    path("orders/<uuid:order_public_id>/initiate/", views.InitiatePaymentView.as_view(), name="payment-initiate"),
    path("orders/<uuid:order_public_id>/status/", views.PaymentStatusView.as_view(), name="payment-status"),
    path("webhook/<str:provider>/", ProviderWebhookView.as_view(), name="payment-webhook"),
]
