import django_filters

from apps.orders.models import Order


class OrderFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    payment_status = django_filters.CharFilter(field_name="payment_status")
    date_from = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    date_to = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")

    class Meta:
        model = Order
        fields = ["status", "payment_status", "date_from", "date_to"]
