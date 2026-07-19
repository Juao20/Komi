from django.contrib import admin
from django.contrib import messages

from apps.core.exceptions import ServiceError
from apps.wallets import services
from apps.wallets.models import Wallet, WalletTransaction, Withdrawal


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("store", "available_balance", "pending_balance", "total_earned", "total_withdrawn", "currency")
    search_fields = ("store__name",)
    readonly_fields = ("public_id", "created_at", "updated_at")


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("reference", "wallet", "type", "amount", "balance_after", "status", "created_at")
    list_filter = ("type", "status")
    search_fields = ("reference", "wallet__store__name")
    readonly_fields = [f.name for f in WalletTransaction._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ("reference", "store", "amount", "currency", "method", "status", "created_at")
    list_filter = ("status", "method")
    search_fields = ("reference", "store__name", "mobile_number")
    readonly_fields = ("public_id", "reference", "created_at", "updated_at", "processed_at", "processed_by")
    actions = ["approve_withdrawals", "reject_withdrawals"]

    @admin.action(description="Valider les retraits sélectionnés")
    def approve_withdrawals(self, request, queryset):
        approved = 0
        for withdrawal in queryset:
            try:
                services.approve_withdrawal(withdrawal=withdrawal, admin_user=request.user)
                approved += 1
            except ServiceError as exc:
                self.message_user(request, f"{withdrawal.reference}: {exc.message}", level=messages.WARNING)
        if approved:
            self.message_user(request, f"{approved} retrait(s) validé(s).")

    @admin.action(description="Refuser les retraits sélectionnés")
    def reject_withdrawals(self, request, queryset):
        rejected = 0
        for withdrawal in queryset:
            try:
                services.reject_withdrawal(withdrawal=withdrawal, reason="Refusé depuis l'administration.", admin_user=request.user)
                rejected += 1
            except ServiceError as exc:
                self.message_user(request, f"{withdrawal.reference}: {exc.message}", level=messages.WARNING)
        if rejected:
            self.message_user(request, f"{rejected} retrait(s) refusé(s).")
