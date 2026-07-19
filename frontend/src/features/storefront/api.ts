import type { PublicCategory, PublicProductDetail, PublicProductListItem, PublicStore } from '@/features/storefront/types'
import { apiClient } from '@/shared/services/api-client'
import type { Paginated } from '@/shared/types/api'

export async function fetchPublicStore(slug: string) {
  const { data } = await apiClient.get<PublicStore>(`/stores/public/${slug}/`)
  return data
}

export interface PublicProductQueryParams {
  search?: string
  category?: string
  ordering?: string
  page?: number
}

export async function fetchPublicProducts(slug: string, params: PublicProductQueryParams) {
  const { data } = await apiClient.get<Paginated<PublicProductListItem>>(`/public/stores/${slug}/products/`, { params })
  return data
}

export async function fetchPublicProduct(slug: string, productSlug: string) {
  const { data } = await apiClient.get<PublicProductDetail>(`/public/stores/${slug}/products/${productSlug}/`)
  return data
}

export async function fetchPublicCategories(slug: string) {
  const { data } = await apiClient.get<PublicCategory[]>(`/public/stores/${slug}/categories/`)
  return data
}

export interface PublicOrderItemPayload {
  product_id: string
  variant_id?: string
  quantity: number
}

export interface PublicOrderPayload {
  customer_name: string
  customer_phone: string
  customer_email?: string
  shipping_address?: string
  shipping_city?: string
  shipping_country?: string
  payment_method: string
  customer_note?: string
  items: PublicOrderItemPayload[]
}

export interface PublicOrderResult {
  public_id: string
  order_number: string
  total_amount: string
  currency: string
}

export async function createPublicOrder(slug: string, payload: PublicOrderPayload) {
  const { data } = await apiClient.post<PublicOrderResult>(`/public/stores/${slug}/orders/`, payload)
  return data
}

export type ProductReportReason = 'counterfeit' | 'inappropriate' | 'misleading' | 'scam' | 'other'

export interface ProductReportPayload {
  reason: ProductReportReason
  message?: string
  reporter_email?: string
}

export async function reportPublicProduct(slug: string, productSlug: string, payload: ProductReportPayload) {
  await apiClient.post(`/public/stores/${slug}/products/${productSlug}/report/`, payload)
}
