from django.contrib import admin

from apps.analytics.models import AnalyticsSnapshot


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ("store", "date", "orders_count", "revenue", "new_customers_count")
    list_filter = ("date",)
    search_fields = ("store__name",)
