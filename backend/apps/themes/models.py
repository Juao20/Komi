from django.db import models

from apps.core.models import TimeStampedModel
from apps.stores.models import hex_color_validator


class FontFamily(models.TextChoices):
    INTER = "inter", "Inter"
    POPPINS = "poppins", "Poppins"
    MANROPE = "manrope", "Manrope"
    SORA = "sora", "Sora"
    WORK_SANS = "work_sans", "Work Sans"


class StoreTheme(TimeStampedModel):
    store = models.OneToOneField("stores.Store", on_delete=models.CASCADE, related_name="theme")

    accent_color = models.CharField(max_length=7, default="#111827", validators=[hex_color_validator])
    font_family = models.CharField(max_length=16, choices=FontFamily.choices, default=FontFamily.INTER)
    show_hero_banner = models.BooleanField(default=True)
    show_social_links = models.BooleanField(default=True)

    class Meta:
        db_table = "themes_store_theme"

    def __str__(self):
        return f"Theme for {self.store.name}"
