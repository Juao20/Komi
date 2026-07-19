from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.stores.mixins import StoreScopedMixin
from apps.wallets import selectors, services
from apps.wallets.serializers import (
    RequestWithdrawalSerializer,
    WalletSerializer,
    WalletTransactionSerializer,
    WithdrawalSerializer,
)


class MyWalletView(StoreScopedMixin, APIView):
    def get(self, request):
        wallet = services.get_or_create_wallet(self.store)
        wallet.monthly_revenue = selectors.get_monthly_revenue(wallet)
        return Response(WalletSerializer(wallet).data)


class WalletTransactionListView(StoreScopedMixin, ListAPIView):
    serializer_class = WalletTransactionSerializer

    def get_queryset(self):
        wallet = services.get_or_create_wallet(self.store)
        return selectors.get_wallet_transactions(wallet)


class WithdrawalListCreateView(StoreScopedMixin, ListAPIView):
    serializer_class = WithdrawalSerializer

    def get_queryset(self):
        return selectors.get_withdrawals_for_store(self.store)

    def post(self, request):
        serializer = RequestWithdrawalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        withdrawal = services.request_withdrawal(store=self.store, **serializer.validated_data)
        return Response(WithdrawalSerializer(withdrawal).data, status=status.HTTP_201_CREATED)
