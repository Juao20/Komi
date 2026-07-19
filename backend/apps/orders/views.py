from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders import selectors, services
from apps.orders.filters import OrderFilter
from apps.orders.serializers import (
    AddOrderCommentSerializer,
    CreateOrderSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
    UpdateOrderStatusSerializer,
)
from apps.stores.mixins import StoreScopedMixin
from apps.stores.selectors import get_published_store_by_slug


class OrderListView(StoreScopedMixin, ListAPIView):
    serializer_class = OrderListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = OrderFilter
    search_fields = ["order_number", "customer_name", "customer_phone"]
    ordering_fields = ["created_at", "total_amount", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return selectors.get_orders_for_store(self.store)


class OrderDetailView(StoreScopedMixin, APIView):
    def get_object(self, public_id):
        order = selectors.get_order_by_public_id(self.store, public_id)
        if order is None:
            raise NotFound("Order not found.")
        return order

    def get(self, request, public_id):
        return Response(OrderDetailSerializer(self.get_object(public_id)).data)


class OrderStatusUpdateView(StoreScopedMixin, APIView):
    def post(self, request, public_id):
        order = selectors.get_order_by_public_id(self.store, public_id)
        if order is None:
            raise NotFound("Order not found.")
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = services.update_order_status(order=order, new_status=serializer.validated_data["status"], note=serializer.validated_data.get("note", ""))
        return Response(OrderDetailSerializer(order).data)


class OrderCommentCreateView(StoreScopedMixin, APIView):
    def post(self, request, public_id):
        order = selectors.get_order_by_public_id(self.store, public_id)
        if order is None:
            raise NotFound("Order not found.")
        serializer = AddOrderCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.add_order_comment(order=order, author=request.user, message=serializer.validated_data["message"])
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


class PublicCreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, slug):
        store = get_published_store_by_slug(slug)
        if store is None:
            raise NotFound("This store doesn't exist or isn't published yet.")
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = services.create_order(store=store, **serializer.validated_data)
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)
