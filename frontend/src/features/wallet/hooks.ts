import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as walletApi from '@/features/wallet/api'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorMessage } from '@/shared/services/api-client'

export const walletKeys = {
  wallet: ['wallet'] as const,
  transactions: (page: number) => ['wallet', 'transactions', page] as const,
  withdrawals: (page: number) => ['wallet', 'withdrawals', page] as const,
}

export function useWallet() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({ queryKey: walletKeys.wallet, queryFn: walletApi.fetchWallet, enabled: Boolean(accessToken) })
}

export function useWalletTransactions(page = 1) {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: walletKeys.transactions(page),
    queryFn: () => walletApi.fetchWalletTransactions(page),
    enabled: Boolean(accessToken),
    placeholderData: (previous) => previous,
  })
}

export function useWithdrawals(page = 1) {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: walletKeys.withdrawals(page),
    queryFn: () => walletApi.fetchWithdrawals(page),
    enabled: Boolean(accessToken),
    placeholderData: (previous) => previous,
  })
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: walletApi.requestWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.wallet })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
      toast.success('Demande de retrait envoyée.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Impossible d'envoyer la demande de retrait.")),
  })
}
