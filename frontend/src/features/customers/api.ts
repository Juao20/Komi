import type { CustomerDetail, CustomerListItem } from '@/features/customers/types'
import { apiClient } from '@/shared/services/api-client'
import type { Paginated } from '@/shared/types/api'

export interface CustomerQueryParams {
  search?: string
  ordering?: string
  page?: number
}

export async function fetchCustomers(params: CustomerQueryParams) {
  const { data } = await apiClient.get<Paginated<CustomerListItem>>('/customers/', { params })
  return data
}

export async function fetchCustomer(publicId: string) {
  const { data } = await apiClient.get<CustomerDetail>(`/customers/${publicId}/`)
  return data
}

export async function updateCustomer(publicId: string, payload: { notes?: string; full_name?: string; email?: string }) {
  const { data } = await apiClient.patch<CustomerDetail>(`/customers/${publicId}/`, payload)
  return data
}
