from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai.serializers import (
    AIMessageSerializer,
    BuyerChatRequestSerializer,
    ChatRequestSerializer,
    DailyBriefingSerializer,
    HealthScoreSerializer,
    ProductAnalysisSerializer,
)
from apps.ai.services import AIService
from apps.ai.utils import sanitize_question
from apps.products.selectors import get_product_by_public_id
from apps.stores.mixins import StoreScopedMixin
from apps.stores.selectors import get_published_store_by_slug


class HealthScoreView(StoreScopedMixin, APIView):
    def get(self, request):
        service = AIService()
        if request.query_params.get("explain") == "true":
            data = service.explain_health_score(store=self.store)
        else:
            data = service.get_health_score(store=self.store)
        return Response(HealthScoreSerializer(data).data)


class DailyBriefingView(StoreScopedMixin, APIView):
    def get(self, request):
        briefing = AIService().get_daily_briefing(store=self.store)
        return Response(DailyBriefingSerializer(briefing).data)

    def post(self, request):
        briefing = AIService().get_daily_briefing(store=self.store, force_refresh=True)
        return Response(DailyBriefingSerializer(briefing).data)


class ProductAnalysisView(StoreScopedMixin, APIView):
    def get(self, request, public_id):
        product = get_product_by_public_id(self.store, public_id)
        if product is None:
            raise NotFound("Product not found.")
        analysis = AIService().analyze_product(product=product)
        return Response(ProductAnalysisSerializer({"analysis": analysis}).data)


class MerchantChatView(StoreScopedMixin, APIView):
    def get(self, request):
        conversation = AIService().get_or_create_merchant_conversation(store=self.store, user=request.user)
        return Response(AIMessageSerializer(conversation.messages.all(), many=True).data)

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AIService()
        conversation = service.get_or_create_merchant_conversation(store=self.store, user=request.user)
        question = sanitize_question(serializer.validated_data["question"])
        answer = service.chat(conversation=conversation, question=question)
        return Response({"answer": answer})


class BuyerChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, slug):
        store = get_published_store_by_slug(slug)
        if store is None:
            raise NotFound("This store doesn't exist or isn't published yet.")

        serializer = BuyerChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AIService()
        conversation = service.get_or_create_buyer_conversation(
            store=store, session_key=serializer.validated_data["session_key"]
        )
        question = sanitize_question(serializer.validated_data["question"])
        answer = service.buyer_chat(conversation=conversation, question=question)
        return Response({"answer": answer})
