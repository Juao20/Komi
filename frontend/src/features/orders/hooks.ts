import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as ordersApi from '@/features/orders/api'
import type { OrderQueryParams } from '@/features/orders/api'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorMessage } from '@/shared/services/api-client'

export const orderKeys = {
  all: ['orders'] as const,
  list: (params: OrderQueryParams) => ['orders', 'list', params] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
}

export function useOrders(params: OrderQueryParams) {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.fetchOrders(params),
    enabled: Boolean(accessToken),
    placeholderData: (previous) => previous,
  })
}

export function useOrder(publicId?: string) {
  return useQuery({
    queryKey: orderKeys.detail(publicId ?? ''),
    queryFn: () => ordersApi.fetchOrder(publicId!),
    enabled: Boolean(publicId),
  })
}

export function useUpdateOrderStatus(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { status: string; note?: string }) => ordersApi.updateOrderStatus(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success('Statut de la commande mis à jour.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Transition de statut impossible.')),
  })
}

export function useAddOrderComment(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => ordersApi.addOrderComment(publicId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(publicId) })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
