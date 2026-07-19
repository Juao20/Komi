from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.stores.choices import (
    CURRENCY_CHOICES,
    COUNTRY_CHOICES,
    StorePlan,
    StoreSector,
    StoreStatus,
)

hex_color_validator = RegexValidator(
    regex=r"^#(?:[0-9a-fA-F]{3}){1,2}$",
    message="Enter a valid hex color, e.g. #6C5CE7.",
)


class Store(BaseModel):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="store")

    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=63, unique=True, db_index=True)
    description = models.TextField(blank=True)
    sector = models.CharField(max_length=32, choices=StoreSector.choices, default=StoreSector.OTHER)

    country = models.CharField(max_length=8, choices=COUNTRY_CHOICES)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="XOF")

    phone_number = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=120, blank=True)

    logo_url = models.URLField(blank=True)
    banner_url = models.URLField(blank=True)
    primary_color = models.CharField(max_length=7, default="#6C5CE7", validators=[hex_color_validator])

    social_facebook = models.CharField(max_length=255, blank=True)
    social_instagram = models.CharField(max_length=255, blank=True)
    social_tiktok = models.CharField(max_length=255, blank=True)
    social_whatsapp = models.CharField(max_length=32, blank=True)

    status = models.CharField(max_length=16, choices=StoreStatus.choices, default=StoreStatus.DRAFT)
    plan = models.CharField(max_length=16, choices=StorePlan.choices, default=StorePlan.FREE)
    published_at = models.DateTimeField(null=True, blank=True)
    order_sequence = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "stores_store"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"])]

    def __str__(self):
        return self.name

    @property
    def is_published(self):
        return self.status == StoreStatus.PUBLISHED

    @property
    def public_url(self):
        return f"https://{self.slug}.{self._domain_suffix()}"

    @staticmethod
    def _domain_suffix():
        from django.conf import settings as dj_settings

        return dj_settings.STORE_DOMAIN_SUFFIX

    def publish(self):
        self.status = StoreStatus.PUBLISHED
        self.published_at = timezone.now()
        self.save(update_fields=["status", "published_at"])
