import { MoreHorizontal, Search } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { ExportCsvButton } from '@/features/backoffice/components/ExportCsvButton'
import { PlanBadge, StoreStatusBadge } from '@/features/backoffice/components/StatusBadges'
import { useActivateStore, useAdminStores, useSuspendStore } from '@/features/backoffice/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatNumber } from '@/shared/utils/format'

export function AdminStoresPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [plan, setPlan] = useState('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search)
  const params = {
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    plan: plan === 'all' ? undefined : plan,
    page,
  }
  const { data, isPending } = useAdminStores(params)
  const suspendStore = useSuspendStore()
  const activateStore = useActivateStore()

  const stores = data?.results ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Boutiques"
        description={data ? `${data.count} boutique${data.count > 1 ? 's' : ''}` : 'Gérez les boutiques de la plateforme.'}
        action={<ExportCsvButton path="/backoffice/stores/" params={params} filename="boutiques.csv" />}
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
            placeholder="Rechercher une boutique ou un email…"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publiée</SelectItem>
            <SelectItem value="suspended">Suspendue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={plan} onValueChange={(value) => { setPlan(value); setPage(1) }}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState icon={Search} title="Aucun résultat" description="Aucune boutique ne correspond à votre recherche." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boutique</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.public_id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div>{store.owner_name}</div>
                    <div className="text-xs">{store.owner_email}</div>
                  </TableCell>
                  <TableCell>
                    <StoreStatusBadge status={store.status} />
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={store.plan} />
                  </TableCell>
                  <TableCell>{formatNumber(store.orders_count)}</TableCell>
                  <TableCell>{formatNumber(store.products_count)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {store.status === 'suspended' ? (
                          <DropdownMenuItem onClick={() => activateStore.mutate(store.public_id)}>Réactiver</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem variant="destructive" onClick={() => suspendStore.mutate(store.public_id)}>
                            Suspendre
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
