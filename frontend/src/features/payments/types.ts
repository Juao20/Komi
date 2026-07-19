export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled' | 'refunded'

export interface Payment {
  public_id: string
  provider: string
  payment_reference: string
  amount: string
  currency: string
  status: PaymentStatus
  payment_method: string
  checkout_url: string
  paid_at: string | null
  created_at: string
}
