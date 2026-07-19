import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Smartphone, Truck } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { useCart, useCartStore, useCartTotal } from '@/features/storefront/cart-store'
import { useCreatePublicOrder } from '@/features/storefront/hooks'
import type { PublicStore } from '@/features/storefront/types'
import { useInitiatePayment } from '@/features/payments/hooks'
import { getApiErrorMessage } from '@/shared/services/api-client'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { getContrastColor } from '@/shared/utils/color'
import { formatMoney } from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'

const schema = z.object({
  customer_name: z.string().min(2, 'Nom requis.'),
  customer_phone: z.string().min(6, 'Numéro de téléphone requis.'),
  customer_email: z.string().email('Email invalide.').optional().or(z.literal('')),
  shipping_address: z.string().min(4, 'Adresse requise.'),
  shipping_city: z.string().min(2, 'Ville requise.'),
  customer_note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>
type PaymentChoice = 'cash_on_delivery' | 'mobile_money'

export function StorefrontCheckoutPage() {
  const store = useOutletContext<PublicStore>()
  const navigate = useNavigate()
  const items = useCart(store.slug)
  const total = useCartTotal(store.slug)
  const clearCart = useCartStore((state) => state.clearCart)
  const createOrder = useCreatePublicOrder(store.slug)
  const initiatePayment = useInitiatePayment()
  const contrast = getContrastColor(store.primary_color)
  const orderPlacedRef = useRef(false)
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('mobile_money')
  const [stage, setStage] = useState<'idle' | 'creating-order' | 'redirecting'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (items.length === 0 && !orderPlacedRef.current) {
    return <Navigate to={`/s/${store.slug}/panier`} replace />
  }

  const onSubmit = (values: FormValues) => {
    setStage('creating-order')
    createOrder.mutate(
      {
        ...values,
        payment_method: paymentChoice,
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: (order) => {
          orderPlacedRef.current = true
          clearCart(store.slug)

          if (paymentChoice === 'cash_on_delivery') {
            navigate(`/s/${store.slug}/commande/confirmation`, { state: { order }, replace: true })
            return
          }

          setStage('redirecting')
          const returnUrl = `${window.location.origin}/s/${store.slug}/commande/${order.public_id}/retour`
          initiatePayment.mutate(
            { orderPublicId: order.public_id, returnUrl },
            {
              onSuccess: (payment) => {
                window.location.href = payment.checkout_url
              },
              onError: (error) => {
                setStage('idle')
                toast.error(getApiErrorMessage(error, "Impossible d'initier le paiement."))
                navigate(`/s/${store.slug}/commande/confirmation`, { state: { order }, replace: true })
              },
            },
          )
        },
        onError: (error) => {
          setStage('idle')
          toast.error(getApiErrorMessage(error, 'Impossible de valider la commande.'))
        },
      },
    )
  }

  if (stage === 'redirecting') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Redirection vers le paiement sécurisé…</p>
        <p className="text-xs text-muted-foreground">Ne fermez pas cette page.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Finaliser la commande</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div className="space-y-4 rounded-xl border border-border p-5">
          <p className="text-sm font-semibold">Vos coordonnées</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Nom complet</Label>
              <Input id="customer_name" {...register('customer_name')} aria-invalid={Boolean(errors.customer_name)} />
              {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_phone">Téléphone</Label>
              <Input id="customer_phone" placeholder="+225 07 00 00 00 00" {...register('customer_phone')} aria-invalid={Boolean(errors.customer_phone)} />
              {errors.customer_phone && <p className="text-xs text-destructive">{errors.customer_phone.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer_email">Email (optionnel)</Label>
            <Input id="customer_email" type="email" {...register('customer_email')} />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5">
          <p className="text-sm font-semibold">Livraison</p>
          <div className="space-y-1.5">
            <Label htmlFor="shipping_address">Adresse</Label>
            <Input id="shipping_address" {...register('shipping_address')} aria-invalid={Boolean(errors.shipping_address)} />
            {errors.shipping_address && <p className="text-xs text-destructive">{errors.shipping_address.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shipping_city">Ville</Label>
            <Input id="shipping_city" {...register('shipping_city')} aria-invalid={Boolean(errors.shipping_city)} />
            {errors.shipping_city && <p className="text-xs text-destructive">{errors.shipping_city.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer_note">Note pour le vendeur (optionnel)</Label>
            <Textarea id="customer_note" rows={2} {...register('customer_note')} />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border p-5">
          <p className="text-sm font-semibold">Paiement</p>

          <button
            type="button"
            onClick={() => setPaymentChoice('mobile_money')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
              paymentChoice === 'mobile_money' ? 'border-foreground bg-secondary/50' : 'border-border',
            )}
          >
            <Smartphone className="size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Mobile Money / Carte bancaire</p>
              <p className="text-xs text-muted-foreground">MTN Mobile Money, Moov Money, carte — paiement sécurisé via FedaPay</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentChoice('cash_on_delivery')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
              paymentChoice === 'cash_on_delivery' ? 'border-foreground bg-secondary/50' : 'border-border',
            )}
          >
            <Truck className="size-4 shrink-0" />
            <p className="text-sm font-medium">Paiement à la livraison</p>
          </button>
        </div>

        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total à payer</span>
          <span>{formatMoney(total, store.currency)}</span>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          style={{ backgroundColor: store.primary_color, color: contrast }}
          disabled={stage === 'creating-order'}
        >
          {stage === 'creating-order' && <Loader2 className="animate-spin" />}
          {paymentChoice === 'mobile_money' ? 'Payer maintenant' : 'Confirmer la commande'}
        </Button>
      </form>
    </div>
  )
}
