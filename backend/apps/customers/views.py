from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.customers import selectors, services
from apps.customers.serializers import (
    CustomerDetailSerializer,
    CustomerListSerializer,
    UpdateCustomerSerializer,
)
from apps.stores.mixins import StoreScopedMixin


class CustomerListView(StoreScopedMixin, ListAPIView):
    serializer_class = CustomerListSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["full_name", "phone_number", "email"]
    ordering_fields = ["created_at", "full_name", "total_spent", "order_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return selectors.get_customers_for_store(self.store)


class CustomerDetailView(StoreScopedMixin, APIView):
    def get_object(self, public_id):
        customer = selectors.get_customer_by_public_id(self.store, public_id)
        if customer is None:
            raise NotFound("Customer not found.")
        return customer

    def get(self, request, public_id):
        return Response(CustomerDetailSerializer(self.get_object(public_id)).data)

    def patch(self, request, public_id):
        customer = self.get_object(public_id)
        serializer = UpdateCustomerSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        customer = services.update_customer(customer=customer, **serializer.validated_data)
        return Response(CustomerDetailSerializer(customer).data)
