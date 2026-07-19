export interface Wallet {
  currency: string
  available_balance: string
  pending_balance: string
  total_earned: string
  total_withdrawn: string
  monthly_revenue: string
}

export type WalletTransactionType =
  | 'payment_received'
  | 'order_cancelled'
  | 'refund'
  | 'withdrawal_requested'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'adjustment'

export interface WalletTransaction {
  public_id: string
  type: WalletTransactionType
  status: 'pending' | 'completed' | 'failed'
  amount: string
  balance_after: string
  reference: string
  description: string
  order_number: string | null
  created_at: string
}

export type WithdrawalMethod = 'mtn_momo' | 'moov_money' | 'celtiis_cash'
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected'

export interface Withdrawal {
  public_id: string
  amount: string
  currency: string
  method: WithdrawalMethod
  mobile_number: string
  account_holder_name: string
  status: WithdrawalStatus
  reference: string
  admin_note: string
  processed_at: string | null
  created_at: string
}
