import { useMutation, useQuery } from '@tanstack/react-query'

import * as paymentsApi from '@/features/payments/api'

export function useInitiatePayment() {
  return useMutation({
    mutationFn: ({ orderPublicId, returnUrl }: { orderPublicId: string; returnUrl: string }) =>
      paymentsApi.initiatePayment(orderPublicId, returnUrl),
  })
}

export function usePaymentStatus(orderPublicId: string | undefined, options?: { pollWhileProcessing?: boolean }) {
  return useQuery({
    queryKey: ['payments', 'status', orderPublicId],
    queryFn: () => paymentsApi.fetchPaymentStatus(orderPublicId!),
    enabled: Boolean(orderPublicId),
    refetchInterval: (query) => {
      if (!options?.pollWhileProcessing) return false
      const status = query.state.data?.status
      return status === 'processing' || status === 'pending' ? 2500 : false
    },
  })
}
