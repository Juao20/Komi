import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Loader2, MapPin, MessageSquare, Phone, Send } from 'lucide-react'
import { useState } from 'react'

import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS, PAYMENT_METHOD_LABELS } from '@/features/orders/constants'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { useAddOrderComment, useOrder, useUpdateOrderStatus } from '@/features/orders/hooks'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Textarea } from '@/shared/components/ui/textarea'
import { formatMoney } from '@/shared/utils/format'

export function OrderDetailDrawer({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { data: order, isPending } = useOrder(orderId ?? undefined)
  const updateStatus = useUpdateOrderStatus(orderId ?? '')
  const addComment = useAddOrderComment(orderId ?? '')
  const [comment, setComment] = useState('')

  const nextStatuses = order ? ORDER_STATUS_TRANSITIONS[order.status] ?? [] : []

  return (
    <Sheet open={Boolean(orderId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {isPending || !order ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Commande #{order.order_number}</SheetTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </SheetHeader>

            <SheetBody className="space-y-6">
              {nextStatuses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={status === 'cancelled' ? 'outline' : 'default'}
                      className={status === 'cancelled' ? 'text-destructive hover:text-destructive' : ''}
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ status })}
                    >
                      {updateStatus.isPending && <Loader2 className="animate-spin" />}
                      Marquer « {ORDER_STATUS_LABELS[status]} »
                    </Button>
                  ))}
                </div>
              )}

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">{order.customer_name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5" />
                    {order.customer_phone}
                  </p>
                  {order.shipping_address && (
                    <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      {order.shipping_address}, {order.shipping_city}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Articles</p>
                <div className="mt-2 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.public_id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {item.variant_name && <p className="text-xs text-muted-foreground">{item.variant_name}</p>}
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatMoney(item.unit_price, order.currency)}
                        </p>
                      </div>
                      <p className="font-medium">{formatMoney(item.line_total, order.currency)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{formatMoney(order.subtotal_amount, order.currency)}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Réduction</span>
                    <span>-{formatMoney(order.discount_amount, order.currency)}</span>
                  </div>
                )}
                {Number(order.shipping_amount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span>{formatMoney(order.shipping_amount, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(order.total_amount, order.currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
              </div>

              <Separator />

              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <MessageSquare className="size-3.5" />
                  Notes internes
                </p>
                <div className="mt-2 space-y-2">
                  {order.comments.map((c) => (
                    <div key={c.id} className="rounded-lg bg-secondary p-2.5 text-sm">
                      <p>{c.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.author_name} · {format(new Date(c.created_at), 'd MMM HH:mm', { locale: fr })}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Ajouter une note…"
                    rows={2}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={!comment.trim() || addComment.isPending}
                    onClick={() => {
                      addComment.mutate(comment, { onSuccess: () => setComment('') })
                    }}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
