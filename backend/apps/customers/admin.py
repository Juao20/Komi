from django.contrib import admin

from apps.customers.models import Address, Customer


class AddressInline(admin.TabularInline):
    model = Address
    extra = 0


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone_number", "email", "store", "created_at")
    search_fields = ("full_name", "phone_number", "email", "store__name")
    inlines = [AddressInline]
