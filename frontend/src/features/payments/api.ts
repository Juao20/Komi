import type { Payment } from '@/features/payments/types'
import { apiClient } from '@/shared/services/api-client'

export async function initiatePayment(orderPublicId: string, returnUrl: string) {
  const { data } = await apiClient.post<Payment>(`/payments/orders/${orderPublicId}/initiate/`, {
    return_url: returnUrl,
    provider: 'fedapay',
  })
  return data
}

export async function fetchPaymentStatus(orderPublicId: string) {
  const { data } = await apiClient.get<Payment>(`/payments/orders/${orderPublicId}/status/`)
  return data
}
