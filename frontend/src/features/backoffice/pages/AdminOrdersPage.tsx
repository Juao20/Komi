import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { ExportCsvButton } from '@/features/backoffice/components/ExportCsvButton'
import { OrderPaymentStatusBadge } from '@/features/backoffice/components/StatusBadges'
import { useAdminOrders } from '@/features/backoffice/hooks'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatMoney } from '@/shared/utils/format'

export function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search)
  const params = {
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    payment_status: paymentStatus === 'all' ? undefined : paymentStatus,
    page,
  }
  const { data, isPending } = useAdminOrders(params)
  const orders = data?.results ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Commandes"
        description={data ? `${data.count} commande${data.count > 1 ? 's' : ''}` : 'Toutes les commandes de la plateforme.'}
        action={<ExportCsvButton path="/backoffice/orders/" params={params} filename="commandes.csv" />}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Rechercher une commande, une boutique…"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
          <SelectTrigger className="sm:w-44">
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
        <Select value={paymentStatus} onValueChange={(value) => { setPaymentStatus(value); setPage(1) }}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les paiements</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="failed">Échoué</SelectItem>
            <SelectItem value="refunded">Remboursé</SelectItem>
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
        <EmptyState icon={Search} title="Aucun résultat" description="Aucune commande ne correspond à votre recherche." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Créée le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.public_id}>
                  <TableCell className="font-medium">#{order.order_number}</TableCell>
                  <TableCell className="text-muted-foreground">{order.store_name}</TableCell>
                  <TableCell className="text-muted-foreground">{order.customer_name}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <OrderPaymentStatusBadge status={order.payment_status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatMoney(order.total_amount, order.currency)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(order.created_at), 'd MMM yyyy', { locale: fr })}
                  </TableCell>
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
    </div>
  )
}
