import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as customersApi from '@/features/customers/api'
import type { CustomerQueryParams } from '@/features/customers/api'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorMessage } from '@/shared/services/api-client'

export const customerKeys = {
  all: ['customers'] as const,
  list: (params: CustomerQueryParams) => ['customers', 'list', params] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
}

export function useCustomers(params: CustomerQueryParams) {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customersApi.fetchCustomers(params),
    enabled: Boolean(accessToken),
    placeholderData: (previous) => previous,
  })
}

export function useCustomer(publicId?: string) {
  return useQuery({
    queryKey: customerKeys.detail(publicId ?? ''),
    queryFn: () => customersApi.fetchCustomer(publicId!),
    enabled: Boolean(publicId),
  })
}

export function useUpdateCustomer(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof customersApi.updateCustomer>[1]) => customersApi.updateCustomer(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success('Client mis à jour.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
