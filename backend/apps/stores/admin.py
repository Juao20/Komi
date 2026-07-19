from django.contrib import admin

from apps.stores.models import Store


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "owner", "status", "plan", "country", "currency", "created_at")
    list_filter = ("status", "plan", "sector", "country")
    search_fields = ("name", "slug", "owner__email")
    readonly_fields = ("public_id", "created_at", "updated_at", "published_at")
    autocomplete_fields = ("owner",)
