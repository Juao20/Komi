import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { ExportCsvButton } from '@/features/backoffice/components/ExportCsvButton'
import { PaymentStatusBadge } from '@/features/backoffice/components/StatusBadges'
import { useAdminPayments } from '@/features/backoffice/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatMoney } from '@/shared/utils/format'

export function AdminPaymentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search)
  const params = {
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    page,
  }
  const { data, isPending } = useAdminPayments(params)
  const payments = data?.results ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Paiements"
        description={data ? `${data.count} paiement${data.count > 1 ? 's' : ''}` : 'Historique des paiements FedaPay.'}
        action={<ExportCsvButton path="/backoffice/payments/" params={params} filename="paiements.csv" />}
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
            placeholder="Rechercher une référence, une boutique…"
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
            <SelectItem value="processing">En cours</SelectItem>
            <SelectItem value="successful">Réussi</SelectItem>
            <SelectItem value="failed">Échoué</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
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
      ) : payments.length === 0 ? (
        <EmptyState icon={Search} title="Aucun résultat" description="Aucun paiement ne correspond à votre recherche." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Créé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.public_id}>
                  <TableCell className="font-medium">{payment.payment_reference}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.store_name}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.order_number ? `#${payment.order_number}` : '—'}</TableCell>
                  <TableCell className="text-muted-foreground uppercase">{payment.provider}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatMoney(payment.amount, payment.currency)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(payment.created_at), 'd MMM yyyy', { locale: fr })}
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
