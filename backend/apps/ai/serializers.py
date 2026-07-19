from rest_framework import serializers

from apps.ai.models import AIMessage, DailyBriefing


class HealthScoreSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    level = serializers.CharField()
    breakdown = serializers.ListField()
    explanation = serializers.CharField(required=False)


class DailyBriefingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyBriefing
        fields = ("date", "health_score", "narrative", "tips", "stats_snapshot", "created_at")


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ("public_id", "role", "content", "created_at")


class ChatRequestSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=500, allow_blank=False)


class BuyerChatRequestSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=500, allow_blank=False)
    session_key = serializers.CharField(max_length=64)


class ProductAnalysisSerializer(serializers.Serializer):
    analysis = serializers.CharField()
