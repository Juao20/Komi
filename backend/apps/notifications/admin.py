from django.contrib import admin

from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "store", "category", "is_read", "created_at")
    list_filter = ("category", "is_read")
    search_fields = ("title", "message", "store__name")
