import { Package, Search } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { ProductCard } from '@/features/storefront/components/ProductCard'
import { usePublicCategories, usePublicProducts } from '@/features/storefront/hooks'
import type { PublicStore } from '@/features/storefront/types'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { cn } from '@/shared/utils/cn'

export function StorefrontHomePage() {
  const store = useOutletContext<PublicStore>()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search)
  const { data: categories } = usePublicCategories(store.slug)
  const { data, isPending } = usePublicProducts(store.slug, {
    search: debouncedSearch || undefined,
    category: category ?? undefined,
    page,
  })

  const products = data?.results ?? []

  return (
    <div>
      {store.theme.show_hero_banner && (
        <div
          className="h-40 w-full bg-secondary bg-cover bg-center sm:h-56"
          style={store.banner_url ? { backgroundImage: `url(${store.banner_url})` } : { backgroundColor: `${store.primary_color}14` }}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {!store.theme.show_hero_banner && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{store.name}</h1>
            {store.description && <p className="mt-1 max-w-lg text-muted-foreground">{store.description}</p>}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Rechercher un produit…"
              className="pl-9"
            />
          </div>

          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setCategory(null)
                  setPage(1)
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  category === null ? 'border-transparent bg-foreground text-background' : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                Tout
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.public_id}
                  onClick={() => {
                    setCategory(cat.public_id)
                    setPage(1)
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    category === cat.public_id
                      ? 'border-transparent bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          {isPending ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title={debouncedSearch || category ? 'Aucun produit trouvé' : 'Boutique en préparation'}
              description={
                debouncedSearch || category
                  ? 'Essayez une autre recherche ou catégorie.'
                  : 'Cette boutique ajoute bientôt ses premiers produits.'
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.public_id} product={product} storeSlug={store.slug} currency={store.currency} />
                ))}
              </div>
              {data && data.total_pages > 1 && (
                <div className="mt-4 rounded-xl border border-border">
                  <Pagination
                    currentPage={data.current_page}
                    totalPages={data.total_pages}
                    totalCount={data.count}
                    pageSize={data.page_size}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
