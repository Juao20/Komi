from django.contrib import admin

from apps.backoffice.models import SystemLog


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ("level", "logger_name", "created_at")
    list_filter = ("level",)
    search_fields = ("logger_name", "message")
    readonly_fields = [f.name for f in SystemLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
