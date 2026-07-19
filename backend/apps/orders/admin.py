from django.contrib import admin

from apps.orders.models import Coupon, Order, OrderComment, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "store", "customer_name", "status", "payment_status", "total_amount", "created_at")
    list_filter = ("status", "payment_status", "payment_method")
    search_fields = ("order_number", "customer_name", "customer_phone", "store__name")
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    readonly_fields = ("public_id", "created_at", "updated_at")


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "store", "discount_type", "discount_value", "is_active", "usage_count")
    search_fields = ("code", "store__name")


admin.site.register(OrderComment)
