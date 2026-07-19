import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { ExportCsvButton } from '@/features/backoffice/components/ExportCsvButton'
import { useAdminProducts } from '@/features/backoffice/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatMoney, formatNumber } from '@/shared/utils/format'

const STATUS_LABELS: Record<string, string> = { draft: 'Brouillon', active: 'Active', archived: 'Archivée' }

export function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search)
  const params = {
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    page,
  }
  const { data, isPending } = useAdminProducts(params)
  const products = data?.results ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Produits"
        description={data ? `${data.count} produit${data.count > 1 ? 's' : ''}` : 'Catalogue de toutes les boutiques.'}
        action={<ExportCsvButton path="/backoffice/products/" params={params} filename="produits.csv" />}
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
            placeholder="Rechercher un produit, une boutique…"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="archived">Archivée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={Search} title="Aucun résultat" description="Aucun produit ne correspond à votre recherche." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.public_id}>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.is_deleted && (
                      <Badge variant="destructive" className="ml-2">
                        Supprimé
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.store_name}</TableCell>
                  <TableCell>{formatMoney(product.price, 'XOF')}</TableCell>
                  <TableCell>{formatNumber(product.stock)}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>{STATUS_LABELS[product.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(product.created_at), 'd MMM yyyy', { locale: fr })}
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
