from django.conf import settings
from django.db import models

from apps.ai.choices import AIFeature, ConversationScope, MessageRole
from apps.core.models import BaseModel, TimeStampedModel


class AIConversation(BaseModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="ai_conversations")
    scope = models.CharField(max_length=16, choices=ConversationScope.choices)

    # Merchant conversations are tied to a logged-in user.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="ai_conversations"
    )
    # Buyer conversations are anonymous, keyed by a client-generated session token.
    session_key = models.CharField(max_length=64, blank=True, db_index=True)

    class Meta:
        db_table = "ai_conversation"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["store", "scope", "session_key"])]

    def __str__(self):
        return f"{self.scope} conversation · {self.store.name}"


class AIMessage(BaseModel):
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=16, choices=MessageRole.choices)
    content = models.TextField()

    class Meta:
        db_table = "ai_message"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.content[:40]}"


class DailyBriefing(TimeStampedModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="ai_daily_briefings")
    date = models.DateField()

    health_score = models.PositiveIntegerField()
    stats_snapshot = models.JSONField(default=dict)
    tips = models.JSONField(default=list)
    narrative = models.TextField(blank=True)

    class Meta:
        db_table = "ai_daily_briefing"
        ordering = ["-date"]
        constraints = [models.UniqueConstraint(fields=["store", "date"], name="unique_briefing_per_store_per_day")]

    def __str__(self):
        return f"{self.store.name} — {self.date}"


class AIUsageLog(TimeStampedModel):
    feature = models.CharField(max_length=32, choices=AIFeature.choices)
    store = models.ForeignKey(
        "stores.Store", on_delete=models.SET_NULL, null=True, blank=True, related_name="ai_usage_logs"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="ai_usage_logs"
    )
    cache_hit = models.BooleanField(default=False)
    tokens_used = models.PositiveIntegerField(default=0)
    duration_ms = models.PositiveIntegerField(default=0)
    success = models.BooleanField(default=True)
    error_message = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = "ai_usage_log"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["feature", "created_at"])]

    def __str__(self):
        return f"{self.feature} · {self.tokens_used} tokens"
