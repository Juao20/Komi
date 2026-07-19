from django.db import models


class PaymentProvider(models.TextChoices):
    FEDAPAY = "fedapay", "FedaPay"
    # Future providers: PAYSTACK, FLUTTERWAVE, CINETPAY, STRIPE...


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "En attente"
    PROCESSING = "processing", "En cours"
    SUCCESSFUL = "successful", "Réussi"
    FAILED = "failed", "Échoué"
    CANCELLED = "cancelled", "Annulé"
    REFUNDED = "refunded", "Remboursé"


TERMINAL_STATUSES = {
    PaymentStatus.SUCCESSFUL,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
    PaymentStatus.REFUNDED,
}


class PaymentMethodType(models.TextChoices):
    MTN_MOMO = "mtn_momo", "MTN Mobile Money"
    MOOV_MOMO = "moov_momo", "Moov Money"
    CARD = "card", "Carte bancaire"
    OTHER = "other", "Autre"
