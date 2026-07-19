import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as productsApi from '@/features/products/api'
import type { ProductQueryParams } from '@/features/products/api'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorMessage } from '@/shared/services/api-client'

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductQueryParams) => ['products', 'list', params] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  categories: ['products', 'categories'] as const,
}

export function useProducts(params: ProductQueryParams) {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.fetchProducts(params),
    enabled: Boolean(accessToken),
    placeholderData: (previous) => previous,
  })
}

export function useProduct(publicId?: string) {
  return useQuery({
    queryKey: productKeys.detail(publicId ?? ''),
    queryFn: () => productsApi.fetchProduct(publicId!),
    enabled: Boolean(publicId),
  })
}

export function useCategories() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: productsApi.fetchCategories,
    enabled: Boolean(accessToken),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsApi.createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.categories }),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Produit ajouté avec succès.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Impossible d'ajouter le produit.")),
  })
}

export function useUpdateProduct(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof productsApi.updateProduct>[1]) => productsApi.updateProduct(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Produit mis à jour.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Produit supprimé.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDuplicateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsApi.duplicateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Produit dupliqué.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useArchiveProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: productsApi.archiveProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Produit archivé.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
