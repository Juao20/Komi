import { Store } from 'lucide-react'
import { Outlet, useParams } from 'react-router-dom'

import { ComyBuyerWidget } from '@/features/storefront/components/ComyBuyerWidget'
import { StorefrontFooter } from '@/features/storefront/components/StorefrontFooter'
import { StorefrontHeader } from '@/features/storefront/components/StorefrontHeader'
import { usePublicStore } from '@/features/storefront/hooks'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function StorefrontLayout() {
  const { slug } = useParams<{ slug: string }>()
  const { data: store, isPending, isError } = usePublicStore(slug ?? '')

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center px-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Store className="size-5" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">Boutique introuvable</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Cette boutique n'existe pas ou n'est pas encore publiée.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: FONT_STACKS[store.theme.font_family] }}>
      <StorefrontHeader store={store} />
      <main>
        <Outlet context={store} />
      </main>
      <StorefrontFooter store={store} />
      <ComyBuyerWidget store={store} />
    </div>
  )
}

const FONT_STACKS: Record<string, string> = {
  inter: "'Inter', sans-serif",
  poppins: "'Poppins', sans-serif",
  manrope: "'Manrope', sans-serif",
  sora: "'Sora', sans-serif",
  work_sans: "'Work Sans', sans-serif",
}
