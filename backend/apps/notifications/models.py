from django.db import models

from apps.core.models import BaseModel


class NotificationCategory(models.TextChoices):
    NEW_ORDER = "new_order", "Nouvelle commande"
    ORDER_CONFIRMED = "order_confirmed", "Commande confirmée"
    ORDER_CANCELLED = "order_cancelled", "Commande annulée"
    PRODUCT_ADDED = "product_added", "Produit ajouté"
    PRODUCT_DELETED = "product_deleted", "Produit supprimé"
    LOW_STOCK = "low_stock", "Stock faible"
    STORE_PUBLISHED = "store_published", "Boutique publiée"
    WELCOME = "welcome", "Bienvenue"
    SYSTEM = "system", "Système"


class Notification(BaseModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="notifications")
    category = models.CharField(max_length=32, choices=NotificationCategory.choices, default=NotificationCategory.SYSTEM)
    title = models.CharField(max_length=150)
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = "notifications_notification"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["store", "is_read"])]

    def __str__(self):
        return self.title
