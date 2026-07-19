from django.db import models


class WalletTransactionType(models.TextChoices):
    PAYMENT_RECEIVED = "payment_received", "Paiement reçu"
    ORDER_CANCELLED = "order_cancelled", "Commande annulée"
    REFUND = "refund", "Remboursement"
    WITHDRAWAL_REQUESTED = "withdrawal_requested", "Retrait demandé"
    WITHDRAWAL_APPROVED = "withdrawal_approved", "Retrait validé"
    WITHDRAWAL_REJECTED = "withdrawal_rejected", "Retrait refusé"
    ADJUSTMENT = "adjustment", "Ajustement"


class WalletTransactionStatus(models.TextChoices):
    PENDING = "pending", "En attente"
    COMPLETED = "completed", "Terminée"
    FAILED = "failed", "Échouée"


class WithdrawalMethod(models.TextChoices):
    MTN_MOMO = "mtn_momo", "MTN Mobile Money"
    MOOV_MONEY = "moov_money", "Moov Money"
    CELTIIS_CASH = "celtiis_cash", "Celtiis Cash"


class WithdrawalStatus(models.TextChoices):
    PENDING = "pending", "En attente"
    APPROVED = "approved", "Validé"
    REJECTED = "rejected", "Refusé"
