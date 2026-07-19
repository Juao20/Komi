import { Search, Users } from 'lucide-react'
import { useState } from 'react'

import { CustomerDetailDrawer } from '@/features/customers/components/CustomerDetailDrawer'
import { useCustomers } from '@/features/customers/hooks'
import { useMyStore } from '@/features/store/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatMoney, initials } from '@/shared/utils/format'

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(search)
  const { data: store } = useMyStore()
  const { data, isPending } = useCustomers({ search: debouncedSearch || undefined, page })

  const customers = data?.results ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `${data.count} client${data.count > 1 ? 's' : ''}` : 'Vos clients sont ajoutés automatiquement à chaque commande.'}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Rechercher un client…"
          className="pl-9"
        />
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        search ? (
          <EmptyState icon={Search} title="Aucun résultat" description="Aucun client ne correspond à votre recherche." />
        ) : (
          <EmptyState
            icon={Users}
            title="Pas encore de clients"
            description="Vos clients apparaîtront automatiquement ici dès leur première commande."
          />
        )
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead className="text-right">Total dépensé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.public_id} className="cursor-pointer" onClick={() => setActiveCustomerId(customer.public_id)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">{initials(customer.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone_number}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.order_count}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(customer.total_spent, store?.currency ?? 'XOF')}
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

      <CustomerDetailDrawer
        customerId={activeCustomerId}
        currency={store?.currency ?? 'XOF'}
        onClose={() => setActiveCustomerId(null)}
      />
    </div>
  )
}
