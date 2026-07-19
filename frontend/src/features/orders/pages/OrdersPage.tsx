import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

import { OrderDetailDrawer } from '@/features/orders/components/OrderDetailDrawer'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { useOrders } from '@/features/orders/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatMoney } from '@/shared/utils/format'

export function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(search)
  const { data, isPending } = useOrders({
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    page,
  })

  const orders = data?.results ?? []
  const hasFilters = Boolean(debouncedSearch) || status !== 'all'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Commandes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `${data.count} commande${data.count > 1 ? 's' : ''}` : 'Suivez et gérez vos commandes.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Rechercher une commande, un client…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmée</SelectItem>
            <SelectItem value="processing">Préparation</SelectItem>
            <SelectItem value="shipped">Expédiée</SelectItem>
            <SelectItem value="delivered">Livrée</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        hasFilters ? (
          <EmptyState icon={Search} title="Aucun résultat" description="Aucune commande ne correspond à votre recherche." />
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="Aucune commande pour le moment"
            description="Partagez le lien de votre boutique pour recevoir vos premières commandes."
          />
        )
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.public_id} className="cursor-pointer" onClick={() => setActiveOrderId(order.public_id)}>
                  <TableCell className="font-medium">#{order.order_number}</TableCell>
                  <TableCell>
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.created_at), 'd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatMoney(order.total_amount, order.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data && (
            <Pagination
              currentPage={data.current_page}
              totalPages={data.total_pages}
              totalCount={data.count}
              pageSize={data.page_size}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      <OrderDetailDrawer orderId={activeOrderId} onClose={() => setActiveOrderId(null)} />
    </div>
  )
}
