from django.contrib import admin

from apps.ai.models import AIConversation, AIMessage, AIUsageLog, DailyBriefing


class AIMessageInline(admin.TabularInline):
    model = AIMessage
    extra = 0
    readonly_fields = ("role", "content", "created_at")


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ("store", "scope", "user", "session_key", "created_at")
    list_filter = ("scope",)
    search_fields = ("store__name", "user__email", "session_key")
    inlines = [AIMessageInline]


@admin.register(DailyBriefing)
class DailyBriefingAdmin(admin.ModelAdmin):
    list_display = ("store", "date", "health_score", "created_at")
    list_filter = ("date",)
    search_fields = ("store__name",)
    readonly_fields = ("stats_snapshot", "tips", "narrative")


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    list_display = ("feature", "store", "user", "cache_hit", "tokens_used", "duration_ms", "success", "created_at")
    list_filter = ("feature", "cache_hit", "success")
    search_fields = ("store__name", "user__email")
    readonly_fields = [f.name for f in AIUsageLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
