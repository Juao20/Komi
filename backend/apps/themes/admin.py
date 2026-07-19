from django.contrib import admin

from apps.themes.models import StoreTheme


@admin.register(StoreTheme)
class StoreThemeAdmin(admin.ModelAdmin):
    list_display = ("store", "accent_color", "font_family", "updated_at")
    search_fields = ("store__name",)
