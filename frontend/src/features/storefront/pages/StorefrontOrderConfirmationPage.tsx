import { CheckCircle2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, Navigate, useLocation, useOutletContext } from 'react-router-dom'

import type { PublicOrderResult } from '@/features/storefront/api'
import { useCartStore } from '@/features/storefront/cart-store'
import type { PublicStore } from '@/features/storefront/types'
import { Button } from '@/shared/components/ui/button'
import { formatMoney } from '@/shared/utils/format'

export function StorefrontOrderConfirmationPage() {
  const store = useOutletContext<PublicStore>()
  const location = useLocation()
  const order = (location.state as { order?: PublicOrderResult } | null)?.order
  const clearCart = useCartStore((state) => state.clearCart)
  const hasCleared = useRef(false)

  useEffect(() => {
    if (order && !hasCleared.current) {
      hasCleared.current = true
      clearCart(store.slug)
    }
  }, [order, store.slug, clearCart])

  if (!order) {
    return <Navigate to={`/s/${store.slug}`} replace />
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-7" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Merci pour votre commande !</h1>
      <p className="mt-2 text-muted-foreground">
        Votre commande <span className="font-medium text-foreground">#{order.order_number}</span> a bien été reçue.{' '}
        {store.name} vous contactera bientôt pour confirmer la livraison.
      </p>

      <div className="mt-6 rounded-xl border border-border p-5 text-left">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Numéro de commande</span>
          <span className="font-medium">#{order.order_number}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">{formatMoney(order.total_amount, order.currency)}</span>
        </div>
      </div>

      <Button asChild className="mt-8">
        <Link to={`/s/${store.slug}`}>Continuer mes achats</Link>
      </Button>
    </div>
  )
}
