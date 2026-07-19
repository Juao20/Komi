import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Loader2, Mail, MapPin, Phone, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useCustomer, useUpdateCustomer } from '@/features/customers/hooks'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Textarea } from '@/shared/components/ui/textarea'
import { formatMoney, initials } from '@/shared/utils/format'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'

export function CustomerDetailDrawer({
  customerId,
  currency,
  onClose,
}: {
  customerId: string | null
  currency: string
  onClose: () => void
}) {
  const { data: customer, isPending } = useCustomer(customerId ?? undefined)
  const updateCustomer = useUpdateCustomer(customerId ?? '')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setNotes(customer?.notes ?? '')
  }, [customer?.notes])

  return (
    <Sheet open={Boolean(customerId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {isPending || !customer ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback>{initials(customer.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle>{customer.full_name}</SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    Client depuis {format(new Date(customer.created_at), 'MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Commandes</p>
                    <p className="mt-1 text-xl font-semibold">{customer.order_count}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Total dépensé</p>
                    <p className="mt-1 text-xl font-semibold">{formatMoney(customer.total_spent, currency)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {customer.phone_number}
                </p>
                {customer.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground" />
                    {customer.email}
                  </p>
                )}
              </div>

              {customer.addresses.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Adresses</p>
                    <div className="mt-2 space-y-2">
                      {customer.addresses.map((address) => (
                        <p key={address.public_id} className="flex items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                          {address.full_address}, {address.city}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notes">Notes internes</Label>
                <Textarea id="notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateCustomer.isPending || notes === customer.notes}
                  onClick={() => updateCustomer.mutate({ notes })}
                >
                  {updateCustomer.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                  Enregistrer
                </Button>
              </div>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
