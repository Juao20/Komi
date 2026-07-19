import { Minus, Package, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'

import { useCart, useCartStore, useCartTotal } from '@/features/storefront/cart-store'
import type { PublicStore } from '@/features/storefront/types'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/ui/button'
import { getContrastColor } from '@/shared/utils/color'
import { formatMoney } from '@/shared/utils/format'

export function StorefrontCartPage() {
  const store = useOutletContext<PublicStore>()
  const navigate = useNavigate()
  const items = useCart(store.slug)
  const total = useCartTotal(store.slug)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const contrast = getContrastColor(store.primary_color)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={ShoppingBag}
          title="Votre panier est vide"
          description="Parcourez la boutique et ajoutez des produits à votre panier."
          action={
            <Button asChild>
              <Link to={`/s/${store.slug}`}>Continuer mes achats</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Mon panier</h1>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {items.map((item) => {
          const key = `${item.productId}-${item.variantId ?? ''}`
          return (
            <div key={key} className="flex items-center gap-4 p-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Package className="size-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                <p className="mt-0.5 text-sm text-muted-foreground">{formatMoney(item.unitPrice, store.currency)}</p>
              </div>
              <div className="flex items-center rounded-lg border border-border">
                <button
                  onClick={() => updateQuantity(store.slug, item.productId, item.variantId, item.quantity - 1)}
                  className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  disabled={item.quantity >= item.maxStock}
                  onClick={() => updateQuantity(store.slug, item.productId, item.variantId, item.quantity + 1)}
                  className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <button
                onClick={() => removeItem(store.slug, item.productId, item.variantId)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-base font-semibold">
        <span>Total</span>
        <span>{formatMoney(total, store.currency)}</span>
      </div>

      <Button
        size="lg"
        className="mt-6 w-full"
        style={{ backgroundColor: store.primary_color, color: contrast }}
        onClick={() => navigate(`/s/${store.slug}/commande`)}
      >
        Passer la commande
      </Button>
    </div>
  )
}
