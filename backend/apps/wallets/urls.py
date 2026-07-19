from django.urls import path

from apps.wallets import views

urlpatterns = [
    path("me/", views.MyWalletView.as_view(), name="wallet-me"),
    path("transactions/", views.WalletTransactionListView.as_view(), name="wallet-transactions"),
    path("withdrawals/", views.WithdrawalListCreateView.as_view(), name="wallet-withdrawals"),
]
