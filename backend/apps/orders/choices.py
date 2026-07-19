from django.db import models


class OrderStatus(models.TextChoices):
    PENDING = "pending", "En attente"
    CONFIRMED = "confirmed", "Confirmée"
    PROCESSING = "processing", "Préparation"
    SHIPPED = "shipped", "Expédiée"
    DELIVERED = "delivered", "Livrée"
    CANCELLED = "cancelled", "Annulée"


ORDER_STATUS_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.CONFIRMED, OrderStatus.CANCELLED},
    OrderStatus.CONFIRMED: {OrderStatus.PROCESSING, OrderStatus.CANCELLED},
    OrderStatus.PROCESSING: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED, OrderStatus.CANCELLED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}


class PaymentMethod(models.TextChoices):
    MOBILE_MONEY = "mobile_money", "Mobile Money"
    CARD = "card", "Carte bancaire"
    CASH_ON_DELIVERY = "cash_on_delivery", "Paiement à la livraison"
    OTHER = "other", "Autre"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "En attente"
    PAID = "paid", "Payé"
    FAILED = "failed", "Échoué"
    REFUNDED = "refunded", "Remboursé"


class DiscountType(models.TextChoices):
    PERCENTAGE = "percentage", "Pourcentage"
    FIXED = "fixed", "Montant fixe"
