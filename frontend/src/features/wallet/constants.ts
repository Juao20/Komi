import type { BadgeProps } from '@/shared/components/ui/badge'

export const WITHDRAWAL_METHOD_LABELS: Record<string, string> = {
  mtn_momo: 'MTN Mobile Money',
  moov_money: 'Moov Money',
  celtiis_cash: 'Celtiis Cash',
}

export const WITHDRAWAL_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Validé',
  rejected: 'Refusé',
}

export const WITHDRAWAL_STATUS_VARIANTS: Record<string, NonNullable<BadgeProps['variant']>> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

export const WALLET_TRANSACTION_LABELS: Record<string, string> = {
  payment_received: 'Paiement reçu',
  order_cancelled: 'Commande annulée',
  refund: 'Remboursement',
  withdrawal_requested: 'Retrait demandé',
  withdrawal_approved: 'Retrait validé',
  withdrawal_rejected: 'Retrait refusé',
  adjustment: 'Ajustement',
}
