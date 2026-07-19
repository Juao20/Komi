from rest_framework import serializers

from apps.customers.serializers import CustomerListSerializer
from apps.orders.serializers import OrderListSerializer


class DashboardStatsSerializer(serializers.Serializer):
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    revenue_growth_pct = serializers.FloatField()
    orders_count = serializers.IntegerField()
    orders_growth_pct = serializers.FloatField()
    customers_count = serializers.IntegerField()
    products_count = serializers.IntegerField()
    average_order_value = serializers.DecimalField(max_digits=14, decimal_places=2)
    pending_orders_count = serializers.IntegerField()


class SalesPointSerializer(serializers.Serializer):
    day = serializers.DateField()
    orders_count = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)


class TopProductSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(allow_null=True)
    product_name = serializers.CharField()
    units_sold = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)


class DashboardOverviewSerializer(serializers.Serializer):
    stats = DashboardStatsSerializer()
    sales_over_time = SalesPointSerializer(many=True)
    top_products = TopProductSerializer(many=True)
    order_status_breakdown = serializers.DictField(child=serializers.IntegerField())
    recent_orders = OrderListSerializer(many=True)
    best_customers = CustomerListSerializer(many=True)
