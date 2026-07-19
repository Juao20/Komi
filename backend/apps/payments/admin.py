from django.contrib import admin

from apps.payments.models import Payment, PaymentEvent


class PaymentEventInline(admin.TabularInline):
    model = PaymentEvent
    extra = 0
    readonly_fields = ("provider", "event_type", "raw_payload", "received_at")
    can_delete = False


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("payment_reference", "store", "order", "provider", "amount", "currency", "status", "created_at")
    list_filter = ("provider", "status")
    search_fields = ("payment_reference", "transaction_id", "order__order_number", "store__name")
    readonly_fields = ("public_id", "created_at", "updated_at")
    inlines = [PaymentEventInline]
