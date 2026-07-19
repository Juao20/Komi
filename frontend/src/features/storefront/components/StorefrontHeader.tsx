import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useCartCount } from '@/features/storefront/cart-store'
import type { PublicStore } from '@/features/storefront/types'
import { Logo } from '@/shared/components/Logo'
import { getContrastColor } from '@/shared/utils/color'

export function StorefrontHeader({ store }: { store: PublicStore }) {
  const cartCount = useCartCount(store.slug)
  const contrast = getContrastColor(store.primary_color)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={`/s/${store.slug}`} className="flex items-center gap-2.5">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="size-9 rounded-full object-cover" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary">
              <Logo variant="icon" className="size-5" />
            </span>
          )}
          <span className="font-semibold tracking-tight">{store.name}</span>
        </Link>

        <Link
          to={`/s/${store.slug}/panier`}
          className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
        >
          <ShoppingBag className="size-5" />
          {cartCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: store.primary_color, color: contrast }}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
