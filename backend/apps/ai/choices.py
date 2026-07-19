from django.db import models


class ConversationScope(models.TextChoices):
    MERCHANT = "merchant", "Commerçant"
    BUYER = "buyer", "Acheteur"


class MessageRole(models.TextChoices):
    USER = "user", "Utilisateur"
    ASSISTANT = "assistant", "Comy"


class AIFeature(models.TextChoices):
    HEALTH_EXPLAIN = "health_explain", "Explication du score de santé"
    DAILY_BRIEFING = "daily_briefing", "Briefing quotidien"
    PRODUCT_ANALYSIS = "product_analysis", "Analyse produit"
    MERCHANT_CHAT = "merchant_chat", "Chat commerçant"
    BUYER_CHAT = "buyer_chat", "Chat acheteur"
