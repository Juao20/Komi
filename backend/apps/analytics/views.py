from rest_framework.response import Response
from rest_framework.views import APIView

from apps.analytics import selectors
from apps.analytics.serializers import (
    DashboardOverviewSerializer,
    SalesPointSerializer,
    TopProductSerializer,
)
from apps.customers.serializers import CustomerListSerializer
from apps.stores.mixins import StoreScopedMixin


class DashboardOverviewView(StoreScopedMixin, APIView):
    def get(self, request):
        days = int(request.query_params.get("days", 30))
        data = {
            "stats": selectors.get_dashboard_stats(self.store, days=days),
            "sales_over_time": selectors.get_sales_over_time(self.store, days=days),
            "top_products": selectors.get_top_products(self.store, days=days),
            "order_status_breakdown": selectors.get_order_status_breakdown(self.store),
            "recent_orders": selectors.get_recent_orders(self.store),
            "best_customers": selectors.get_best_customers(self.store),
        }
        return Response(DashboardOverviewSerializer(data).data)


class SalesOverTimeView(StoreScopedMixin, APIView):
    def get(self, request):
        days = int(request.query_params.get("days", 30))
        data = selectors.get_sales_over_time(self.store, days=days)
        return Response(SalesPointSerializer(data, many=True).data)


class TopProductsView(StoreScopedMixin, APIView):
    def get(self, request):
        days = int(request.query_params.get("days", 30))
        limit = int(request.query_params.get("limit", 5))
        data = selectors.get_top_products(self.store, days=days, limit=limit)
        return Response(TopProductSerializer(data, many=True).data)


class BestCustomersView(StoreScopedMixin, APIView):
    def get(self, request):
        limit = int(request.query_params.get("limit", 5))
        data = selectors.get_best_customers(self.store, limit=limit)
        return Response(CustomerListSerializer(data, many=True).data)
