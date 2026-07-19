from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.backoffice import selectors, services
from apps.backoffice.exports import CSVExportMixin
from apps.backoffice.permissions import IsStaffUser
from apps.backoffice.serializers import (
    AdminEmailLogSerializer,
    AdminOrderSerializer,
    AdminPaymentSerializer,
    AdminProductReportSerializer,
    AdminProductSerializer,
    AdminStoreSerializer,
    AdminUserSerializer,
    SystemLogSerializer,
)


class DashboardView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        return Response(selectors.get_dashboard_kpis())


class AnalyticsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        return Response(selectors.get_analytics(days=days))


class StoreListView(CSVExportMixin, ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminStoreSerializer
    export_fields = ("name", "slug", "owner.email", "status", "plan", "country", "currency", "created_at")
    export_headers = ("Nom", "Slug", "Propriétaire", "Statut", "Plan", "Pays", "Devise", "Créée le")
    export_filename = "boutiques.csv"

    def get_queryset(self):
        params = self.request.query_params
        return selectors.get_stores_queryset(
            search=params.get("search"), status=params.get("status"), plan=params.get("plan")
        )


class StoreSuspendView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, public_id):
        store = selectors.get_store_by_public_id(public_id)
        if store is None:
            raise NotFound("Boutique introuvable.")
        services.suspend_store(store)
        return Response(AdminStoreSerializer(store).data)


class StoreActivateView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, public_id):
        store = selectors.get_store_by_public_id(public_id)
        if store is None:
            raise NotFound("Boutique introuvable.")
        services.activate_store(store)
        return Response(AdminStoreSerializer(store).data)


class UserListView(CSVExportMixin, ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminUserSerializer
    export_fields = ("email", "full_name", "phone_number", "is_active", "created_at")
    export_headers = ("Email", "Nom", "Téléphone", "Actif", "Créé le")
    export_filename = "utilisateurs.csv"

    def get_queryset(self):
        params = self.request.query_params
        is_active = params.get("is_active")
        return selectors.get_users_queryset(
            search=params.get("search"),
            is_active={"true": True, "false": False}.get(is_active) if is_active else None,
        )


class UserSuspendView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, public_id):
        user = selectors.get_user_by_public_id(public_id)
        if user is None:
            raise NotFound("Utilisateur introuvable.")
        services.suspend_user(user)
        return Response(AdminUserSerializer(user).data)


class UserActivateView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, public_id):
        user = selectors.get_user_by_public_id(public_id)
        if user is None:
            raise NotFound("Utilisateur introuvable.")
        services.activate_user(user)
        return Response(AdminUserSerializer(user).data)


class OrderListView(CSVExportMixin, ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminOrderSerializer
    export_fields = ("order_number", "store.name", "status", "payment_status", "total_amount", "currency", "created_at")
    export_headers = ("N° commande", "Boutique", "Statut", "Paiement", "Montant", "Devise", "Créée le")
    export_filename = "commandes.csv"

    def get_queryset(self):
        params = self.request.query_params
        return selectors.get_orders_queryset(
            search=params.get("search"), status=params.get("status"), payment_status=params.get("payment_status")
        )


class PaymentListView(CSVExportMixin, ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminPaymentSerializer
    export_fields = ("payment_reference", "store.name", "provider", "amount", "currency", "status", "created_at")
    export_headers = ("Référence", "Boutique", "Fournisseur", "Montant", "Devise", "Statut", "Créé le")
    export_filename = "paiements.csv"

    def get_queryset(self):
        params = self.request.query_params
        return selectors.get_payments_queryset(
            search=params.get("search"), status=params.get("status"), provider=params.get("provider")
        )


class ProductListView(CSVExportMixin, ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminProductSerializer
    export_fields = ("name", "store.name", "price", "stock", "status", "created_at")
    export_headers = ("Nom", "Boutique", "Prix", "Stock", "Statut", "Créé le")
    export_filename = "produits.csv"

    def get_queryset(self):
        params = self.request.query_params
        return selectors.get_products_queryset(
            search=params.get("search"), status=params.get("status"), store_id=params.get("store_id")
        )


class SubscriptionsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        return Response({"breakdown": selectors.get_subscriptions_breakdown(), "mrr": selectors.compute_mrr()})


class ComyUsageView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        return Response(selectors.get_comy_usage_stats(days=days))


class ReportListView(CSVExportMixin, ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminProductReportSerializer
    export_fields = ("product.name", "product.store.name", "reason", "status", "reporter_email", "created_at")
    export_headers = ("Produit", "Boutique", "Motif", "Statut", "Email du plaignant", "Créé le")
    export_filename = "signalements.csv"

    def get_queryset(self):
        return selectors.get_reports_queryset(status=self.request.query_params.get("status"))


class ReportResolveView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, public_id):
        report = selectors.get_report_by_public_id(public_id)
        if report is None:
            raise NotFound("Signalement introuvable.")
        services.resolve_report(report)
        return Response(AdminProductReportSerializer(report).data)


class ReportDismissView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, public_id):
        report = selectors.get_report_by_public_id(public_id)
        if report is None:
            raise NotFound("Signalement introuvable.")
        services.dismiss_report(report)
        return Response(AdminProductReportSerializer(report).data)


class SystemLogListView(ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = SystemLogSerializer

    def get_queryset(self):
        return selectors.get_system_logs_queryset(level=self.request.query_params.get("level"))


class EmailLogListView(CSVExportMixin, ListAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = AdminEmailLogSerializer
    export_fields = ("recipient", "subject", "template_name", "status", "created_at")
    export_headers = ("Destinataire", "Sujet", "Template", "Statut", "Créé le")
    export_filename = "emails.csv"

    def get_queryset(self):
        return selectors.get_email_logs_queryset(status=self.request.query_params.get("status"))


class EmailStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        return Response(selectors.get_email_stats())


class PlatformSettingsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        return Response(selectors.get_platform_settings())
