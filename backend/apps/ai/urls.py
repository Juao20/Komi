from django.urls import path

from apps.ai import views

urlpatterns = [
    path("ai/health-score/", views.HealthScoreView.as_view(), name="ai-health-score"),
    path("ai/daily-briefing/", views.DailyBriefingView.as_view(), name="ai-daily-briefing"),
    path("ai/products/<uuid:public_id>/analysis/", views.ProductAnalysisView.as_view(), name="ai-product-analysis"),
    path("ai/chat/", views.MerchantChatView.as_view(), name="ai-chat"),
    path("public/stores/<slug:slug>/ai/chat/", views.BuyerChatView.as_view(), name="ai-buyer-chat"),
]
