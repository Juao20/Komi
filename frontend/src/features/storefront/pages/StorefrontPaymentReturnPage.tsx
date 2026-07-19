import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Link, useOutletContext, useParams } from 'react-router-dom'

import { usePaymentStatus } from '@/features/payments/hooks'
import type { PublicStore } from '@/features/storefront/types'
import { Button } from '@/shared/components/ui/button'
import { formatMoney } from '@/shared/utils/format'

export function StorefrontPaymentReturnPage() {
  const store = useOutletContext<PublicStore>()
  const { orderPublicId } = useParams<{ orderPublicId: string }>()
  const { data: payment, isPending } = usePaymentStatus(orderPublicId, { pollWhileProcessing: true })

  if (isPending || !payment) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Vérification du paiement…</p>
      </div>
    )
  }

  if (payment.status === 'processing' || payment.status === 'pending') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">Nous confirmons votre paiement…</h1>
        <p className="text-sm text-muted-foreground">
          Cela peut prendre quelques instants. Cette page se mettra à jour automatiquement.
        </p>
      </div>
    )
  }

  if (payment.status === 'successful') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Paiement réussi !</h1>
        <p className="mt-2 text-muted-foreground">Votre commande a été confirmée. Merci pour votre achat.</p>

        <div className="mt-6 rounded-xl border border-border p-5 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Référence</span>
            <span className="font-medium">{payment.payment_reference}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Montant payé</span>
            <span className="font-medium">{formatMoney(payment.amount, payment.currency)}</span>
          </div>
        </div>

        <Button asChild className="mt-8">
          <Link to={`/s/${store.slug}`}>Continuer mes achats</Link>
        </Button>
      </div>
    )
  }

  const isCancelled = payment.status === 'cancelled'

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        {isCancelled ? <AlertTriangle className="size-7" /> : <XCircle className="size-7" />}
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        {isCancelled ? 'Paiement annulé' : 'Le paiement a échoué'}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isCancelled
          ? "Vous avez annulé le paiement. Votre commande reste enregistrée, vous pouvez réessayer."
          : "Le paiement n'a pas pu être traité. Aucun montant n'a été débité."}
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Button variant="outline" asChild>
          <Link to={`/s/${store.slug}`}>Retour à la boutique</Link>
        </Button>
      </div>
    </div>
  )
}
