from django.db import models

from apps.core.models import BaseModel
from apps.payments.choices import PaymentMethodType, PaymentProvider, PaymentStatus


class Payment(BaseModel):
    order = models.ForeignKey("orders.Order", on_delete=models.PROTECT, related_name="payments")
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="payments")
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.SET_NULL, null=True, blank=True, related_name="payments"
    )

    provider = models.CharField(max_length=20, choices=PaymentProvider.choices)
    payment_reference = models.CharField(max_length=64, unique=True, db_index=True)
    transaction_id = models.CharField(max_length=255, blank=True, db_index=True)

    amount = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=16, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethodType.choices, blank=True)

    checkout_url = models.URLField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "payments_payment"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["store", "status"])]

    def __str__(self):
        return f"{self.payment_reference} ({self.get_status_display()})"


class PaymentEvent(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="events")
    provider = models.CharField(max_length=20, choices=PaymentProvider.choices)
    event_type = models.CharField(max_length=64)
    raw_payload = models.JSONField()
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payments_event"
        ordering = ["-received_at"]

    def __str__(self):
        return f"{self.event_type} @ {self.received_at:%Y-%m-%d %H:%M}"
