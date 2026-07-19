import type { Wallet, WalletTransaction, Withdrawal, WithdrawalMethod } from '@/features/wallet/types'
import { apiClient } from '@/shared/services/api-client'
import type { Paginated } from '@/shared/types/api'

export async function fetchWallet() {
  const { data } = await apiClient.get<Wallet>('/wallet/me/')
  return data
}

export async function fetchWalletTransactions(page = 1) {
  const { data } = await apiClient.get<Paginated<WalletTransaction>>('/wallet/transactions/', { params: { page } })
  return data
}

export async function fetchWithdrawals(page = 1) {
  const { data } = await apiClient.get<Paginated<Withdrawal>>('/wallet/withdrawals/', { params: { page } })
  return data
}

export interface RequestWithdrawalPayload {
  amount: number
  method: WithdrawalMethod
  mobile_number: string
  account_holder_name: string
}

export async function requestWithdrawal(payload: RequestWithdrawalPayload) {
  const { data } = await apiClient.post<Withdrawal>('/wallet/withdrawals/', payload)
  return data
}
