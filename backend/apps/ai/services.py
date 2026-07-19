import logging
import time

from django.utils import timezone

from apps.ai import cache as ai_cache
from apps.ai import prompts, selectors
from apps.ai.choices import AIFeature, ConversationScope, MessageRole
from apps.ai.context_builder import BuyerContextBuilder, MerchantContextBuilder
from apps.ai.models import AIConversation, AIMessage, AIUsageLog, DailyBriefing
from apps.ai.providers import AIProviderError, get_ai_provider

logger = logging.getLogger(__name__)

FALLBACK_MESSAGE = "Comy est momentanément indisponible. Réessayez dans quelques instants."
CHAT_HISTORY_SIZE = 6


class AIService:
    """Single entrypoint for all AI-backed features: View -> AIService -> ContextBuilder
    -> Selectors -> Provider -> Response. Django always computes the data; the LLM only
    narrates, explains, compares or answers — it never touches the database directly."""

    def __init__(self, provider=None):
        self.provider = provider or get_ai_provider()

    def _complete(self, *, system_prompt, user_prompt, feature, store=None, user=None, max_tokens=400, cache_parts=None, cache_ttl=None):
        started_at = time.perf_counter()

        if cache_parts:
            cached = ai_cache.get_cached(*cache_parts)
            if cached is not None:
                self._log_usage(feature=feature, store=store, user=user, cache_hit=True, started_at=started_at)
                return cached

        try:
            result = self.provider.complete(system_prompt=system_prompt, user_prompt=user_prompt, max_tokens=max_tokens)
        except AIProviderError as exc:
            logger.warning("AI provider error: %s", exc)
            self._log_usage(
                feature=feature, store=store, user=user, started_at=started_at, success=False, error_message=str(exc)
            )
            return FALLBACK_MESSAGE

        if cache_parts:
            ai_cache.set_cached(result.text, *cache_parts, ttl=cache_ttl or ai_cache.DEFAULT_TTL)

        self._log_usage(feature=feature, store=store, user=user, started_at=started_at, tokens_used=result.tokens_used)
        return result.text

    def _log_usage(self, *, feature, store, user, started_at, cache_hit=False, tokens_used=0, success=True, error_message=""):
        try:
            AIUsageLog.objects.create(
                feature=feature,
                store=store,
                user=user,
                cache_hit=cache_hit,
                tokens_used=tokens_used,
                duration_ms=int((time.perf_counter() - started_at) * 1000),
                success=success,
                error_message=error_message[:500],
            )
        except Exception:
            logger.warning("AI usage logging failed.", exc_info=True)

    # ---- Store Health Score (pure Django, no LLM) ----

    def get_health_score(self, *, store):
        return selectors.compute_health_score(store)

    def explain_health_score(self, *, store):
        score_data = selectors.compute_health_score(store)
        context = MerchantContextBuilder(store).build_health_score_context(score_data)
        prompt = prompts.build_health_score_explanation_prompt(context)
        explanation = self._complete(
            system_prompt=prompts.COMY_PERSONA,
            user_prompt=prompt,
            feature=AIFeature.HEALTH_EXPLAIN,
            store=store,
            max_tokens=200,
            cache_parts=("health_explain", store.id, score_data["score"], timezone.localdate()),
            cache_ttl=60 * 60 * 24,
        )
        return {**score_data, "explanation": explanation}

    # ---- Daily briefing (Django analysis + one cached Groq narration per store per day) ----

    def get_daily_briefing(self, *, store, force_refresh=False):
        today = timezone.localdate()
        if not force_refresh:
            existing = DailyBriefing.objects.filter(store=store, date=today).first()
            if existing:
                return existing

        context, health, anomalies = MerchantContextBuilder(store).build_daily_context()
        prompt = prompts.build_daily_briefing_prompt(context)
        narrative = self._complete(
            system_prompt=prompts.COMY_PERSONA, user_prompt=prompt, feature=AIFeature.DAILY_BRIEFING, store=store, max_tokens=300
        )

        tips = self._build_tips(context, anomalies)

        briefing, _ = DailyBriefing.objects.update_or_create(
            store=store,
            date=today,
            defaults={"health_score": health["score"], "stats_snapshot": context, "narrative": narrative, "tips": tips},
        )
        return briefing

    def _build_tips(self, context, anomalies):
        tips = []
        if context["pending_orders"] > 0:
            tips.append({"icon": "package", "message": f"{context['pending_orders']} commande(s) à confirmer."})
        if context["low_stock_products"]:
            tips.append({"icon": "alert", "message": f"Stock faible : {', '.join(context['low_stock_products'][:3])}."})
        for anomaly in anomalies:
            tips.append({"icon": "warning", "message": anomaly["message"]})
        if not tips:
            tips.append({"icon": "check", "message": "Tout est en ordre aujourd'hui."})
        return tips

    # ---- Product analysis ----

    def analyze_product(self, *, product):
        context = MerchantContextBuilder(product.store).build_product_context(product)
        prompt = prompts.build_product_analysis_prompt(context)
        return self._complete(
            system_prompt=prompts.COMY_PERSONA,
            user_prompt=prompt,
            feature=AIFeature.PRODUCT_ANALYSIS,
            store=product.store,
            max_tokens=300,
            cache_parts=("product_analysis", product.id, product.updated_at.timestamp()),
            cache_ttl=60 * 60 * 24 * 7,
        )

    # ---- Merchant chat ----

    def get_or_create_merchant_conversation(self, *, store, user):
        conversation = AIConversation.objects.filter(store=store, scope=ConversationScope.MERCHANT, user=user).first()
        if conversation:
            return conversation
        return AIConversation.objects.create(store=store, scope=ConversationScope.MERCHANT, user=user)

    def chat(self, *, conversation, question):
        AIMessage.objects.create(conversation=conversation, role=MessageRole.USER, content=question)

        history = list(
            conversation.messages.order_by("-created_at").values("role", "content")[:CHAT_HISTORY_SIZE]
        )[::-1]

        context = MerchantContextBuilder(conversation.store).build_chat_context(question)
        prompt = prompts.build_chat_prompt(context, question, history=history[:-1])

        answer = self._complete(
            system_prompt=prompts.COMY_PERSONA,
            user_prompt=prompt,
            feature=AIFeature.MERCHANT_CHAT,
            store=conversation.store,
            user=conversation.user,
            max_tokens=350,
            cache_parts=("chat", conversation.store_id, question.strip().lower(), str(sorted(context.items()))),
            cache_ttl=60 * 30,
        )

        AIMessage.objects.create(conversation=conversation, role=MessageRole.ASSISTANT, content=answer)
        return answer

    # ---- Buyer-facing chat (public data only) ----

    def get_or_create_buyer_conversation(self, *, store, session_key):
        conversation = AIConversation.objects.filter(
            store=store, scope=ConversationScope.BUYER, session_key=session_key
        ).first()
        if conversation:
            return conversation
        return AIConversation.objects.create(store=store, scope=ConversationScope.BUYER, session_key=session_key)

    def buyer_chat(self, *, conversation, question):
        AIMessage.objects.create(conversation=conversation, role=MessageRole.USER, content=question)

        history = list(
            conversation.messages.order_by("-created_at").values("role", "content")[:CHAT_HISTORY_SIZE]
        )[::-1]

        context = BuyerContextBuilder(conversation.store).build_catalog_context(question)
        prompt = prompts.build_buyer_chat_prompt(context, question, history=history[:-1])
        persona = prompts.BUYER_PERSONA_TEMPLATE.format(store_name=conversation.store.name)

        answer = self._complete(
            system_prompt=persona,
            user_prompt=prompt,
            feature=AIFeature.BUYER_CHAT,
            store=conversation.store,
            max_tokens=250,
            cache_parts=("buyer_chat", conversation.store_id, question.strip().lower()),
            cache_ttl=60 * 60,
        )

        AIMessage.objects.create(conversation=conversation, role=MessageRole.ASSISTANT, content=answer)
        return answer
