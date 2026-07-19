from django.contrib import admin

from apps.emails.models import EmailLog


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ("recipient", "subject", "template_name", "status", "provider", "created_at")
    list_filter = ("status", "template_name")
    search_fields = ("recipient", "subject")
    readonly_fields = [f.name for f in EmailLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
