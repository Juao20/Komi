import type { OrderDetail, OrderListItem } from '@/features/orders/types'
import { apiClient } from '@/shared/services/api-client'
import type { Paginated } from '@/shared/types/api'

export interface OrderQueryParams {
  search?: string
  status?: string
  ordering?: string
  page?: number
}

export async function fetchOrders(params: OrderQueryParams) {
  const { data } = await apiClient.get<Paginated<OrderListItem>>('/orders/', { params })
  return data
}

export async function fetchOrder(publicId: string) {
  const { data } = await apiClient.get<OrderDetail>(`/orders/${publicId}/`)
  return data
}

export async function updateOrderStatus(publicId: string, payload: { status: string; note?: string }) {
  const { data } = await apiClient.post<OrderDetail>(`/orders/${publicId}/status/`, payload)
  return data
}

export async function addOrderComment(publicId: string, message: string) {
  const { data } = await apiClient.post<OrderDetail>(`/orders/${publicId}/comments/`, { message })
  return data
}
