import type { CreateStorePayload, Store, StoreTheme } from '@/features/store/types'
import { apiClient } from '@/shared/services/api-client'

export async function createStoreRequest(payload: CreateStorePayload) {
  const { data } = await apiClient.post<Store>('/stores/', payload)
  return data
}

export async function fetchMyStore() {
  const { data } = await apiClient.get<Store>('/stores/me/')
  return data
}

export async function updateMyStore(payload: Partial<Store>) {
  const { data } = await apiClient.patch<Store>('/stores/me/', payload)
  return data
}

export async function publishMyStore() {
  const { data } = await apiClient.post<Store>('/stores/me/publish/')
  return data
}

export async function updateMyStoreTheme(payload: Partial<StoreTheme>) {
  const { data } = await apiClient.patch<StoreTheme>('/themes/me/', payload)
  return data
}
