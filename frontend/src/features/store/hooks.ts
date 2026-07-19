import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as storeApi from '@/features/store/api'
import { authKeys } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorMessage } from '@/shared/services/api-client'

export const storeKeys = {
  mine: ['store', 'mine'] as const,
}

export function useMyStore() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: storeKeys.mine,
    queryFn: storeApi.fetchMyStore,
    enabled: Boolean(accessToken),
    retry: false,
  })
}

export function useCreateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeApi.createStoreRequest,
    onSuccess: (store) => {
      queryClient.setQueryData(storeKeys.mine, store)
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Impossible de créer la boutique.')),
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeApi.updateMyStore,
    onSuccess: (store) => {
      queryClient.setQueryData(storeKeys.mine, store)
      toast.success('Boutique mise à jour.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function usePublishStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeApi.publishMyStore,
    onSuccess: (store) => {
      queryClient.setQueryData(storeKeys.mine, store)
      toast.success('Votre boutique est maintenant publiée !')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useUpdateStoreTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeApi.updateMyStoreTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.mine })
      toast.success('Apparence mise à jour.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
