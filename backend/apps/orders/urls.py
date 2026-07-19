from django.urls import path

from apps.orders import views

urlpatterns = [
    path("orders/", views.OrderListView.as_view(), name="order-list"),
    path("orders/<uuid:public_id>/", views.OrderDetailView.as_view(), name="order-detail"),
    path("orders/<uuid:public_id>/status/", views.OrderStatusUpdateView.as_view(), name="order-status-update"),
    path("orders/<uuid:public_id>/comments/", views.OrderCommentCreateView.as_view(), name="order-comment-create"),
    path("public/stores/<slug:slug>/orders/", views.PublicCreateOrderView.as_view(), name="public-order-create"),
]
