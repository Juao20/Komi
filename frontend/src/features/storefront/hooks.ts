import { useMutation, useQuery } from '@tanstack/react-query'

import * as storefrontApi from '@/features/storefront/api'
import type { PublicOrderPayload, PublicProductQueryParams } from '@/features/storefront/api'

export function usePublicStore(slug: string) {
  return useQuery({
    queryKey: ['storefront', 'store', slug],
    queryFn: () => storefrontApi.fetchPublicStore(slug),
    retry: false,
  })
}

export function usePublicProducts(slug: string, params: PublicProductQueryParams) {
  return useQuery({
    queryKey: ['storefront', 'products', slug, params],
    queryFn: () => storefrontApi.fetchPublicProducts(slug, params),
    placeholderData: (previous) => previous,
  })
}

export function usePublicProduct(slug: string, productSlug?: string) {
  return useQuery({
    queryKey: ['storefront', 'product', slug, productSlug],
    queryFn: () => storefrontApi.fetchPublicProduct(slug, productSlug!),
    enabled: Boolean(productSlug),
  })
}

export function usePublicCategories(slug: string) {
  return useQuery({
    queryKey: ['storefront', 'categories', slug],
    queryFn: () => storefrontApi.fetchPublicCategories(slug),
  })
}

export function useCreatePublicOrder(slug: string) {
  return useMutation({
    mutationFn: (payload: PublicOrderPayload) => storefrontApi.createPublicOrder(slug, payload),
  })
}

export function useReportPublicProduct(slug: string, productSlug: string) {
  return useMutation({
    mutationFn: (payload: storefrontApi.ProductReportPayload) => storefrontApi.reportPublicProduct(slug, productSlug, payload),
  })
}
