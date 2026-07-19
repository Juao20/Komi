import type { Category, ProductDetail, ProductListItem, ProductWritePayload } from '@/features/products/types'
import { apiClient } from '@/shared/services/api-client'
import type { Paginated } from '@/shared/types/api'

export interface ProductQueryParams {
  search?: string
  category?: string
  status?: string
  ordering?: string
  page?: number
}

export async function fetchProducts(params: ProductQueryParams) {
  const { data } = await apiClient.get<Paginated<ProductListItem>>('/products/', { params })
  return data
}

export async function fetchProduct(publicId: string) {
  const { data } = await apiClient.get<ProductDetail>(`/products/${publicId}/`)
  return data
}

export async function createProduct(payload: ProductWritePayload) {
  const { data } = await apiClient.post<ProductDetail>('/products/', payload)
  return data
}

export async function updateProduct(publicId: string, payload: Partial<ProductWritePayload>) {
  const { data } = await apiClient.patch<ProductDetail>(`/products/${publicId}/`, payload)
  return data
}

export async function deleteProduct(publicId: string) {
  await apiClient.delete(`/products/${publicId}/`)
}

export async function duplicateProduct(publicId: string) {
  const { data } = await apiClient.post<ProductDetail>(`/products/${publicId}/duplicate/`)
  return data
}

export async function archiveProduct(publicId: string) {
  const { data } = await apiClient.post<ProductDetail>(`/products/${publicId}/archive/`)
  return data
}

export async function fetchCategories() {
  const { data } = await apiClient.get<Category[]>('/categories/')
  return data
}

export async function createCategory(payload: { name: string }) {
  const { data } = await apiClient.post<Category>('/categories/', payload)
  return data
}
