import { Flag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useReportPublicProduct } from '@/features/storefront/hooks'
import type { ProductReportReason } from '@/features/storefront/api'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { getApiErrorMessage } from '@/shared/services/api-client'

const REASON_OPTIONS: { value: ProductReportReason; label: string }[] = [
  { value: 'counterfeit', label: 'Contrefaçon' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'misleading', label: 'Description trompeuse' },
  { value: 'scam', label: 'Arnaque suspectée' },
  { value: 'other', label: 'Autre' },
]

export function ReportProductDialog({ storeSlug, productSlug }: { storeSlug: string; productSlug: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ProductReportReason | ''>('')
  const [message, setMessage] = useState('')

  const reportProduct = useReportPublicProduct(storeSlug, productSlug)

  const handleSubmit = () => {
    if (!reason) {
      toast.error('Choisissez un motif de signalement.')
      return
    }
    reportProduct.mutate(
      { reason, message: message || undefined },
      {
        onSuccess: () => {
          toast.success('Merci, votre signalement a été transmis.')
          setOpen(false)
          setReason('')
          setMessage('')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Impossible d'envoyer le signalement.")),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="size-3.5" />
          Signaler ce produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler ce produit</DialogTitle>
          <DialogDescription>Aidez-nous à garder KOMI sûr en signalant un problème avec ce produit.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Motif</Label>
            <Select value={reason} onValueChange={(value) => value && setReason(value as ProductReportReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un motif" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Détails (facultatif)</Label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Décrivez le problème…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={reportProduct.isPending}>
            {reportProduct.isPending ? 'Envoi…' : 'Envoyer le signalement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
