import { Copy, MoreHorizontal, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  useArchiveProduct,
  useCategories,
  useDeleteProduct,
  useDuplicateProduct,
  useProducts,
} from '@/features/products/hooks'
import type { ProductListItem } from '@/features/products/types'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useMyStore } from '@/features/store/hooks'
import { formatMoney } from '@/shared/utils/format'

const STATUS_LABELS: Record<string, string> = { draft: 'Brouillon', active: 'Active', archived: 'Archivée' }

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [category, setCategory] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [productToDelete, setProductToDelete] = useState<ProductListItem | null>(null)

  const debouncedSearch = useDebouncedValue(search)
  const { data: store } = useMyStore()
  const { data: categories } = useCategories()
  const { data, isPending } = useProducts({
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    category: category === 'all' ? undefined : category,
    page,
  })

  const deleteProduct = useDeleteProduct()
  const duplicateProduct = useDuplicateProduct()
  const archiveProduct = useArchiveProduct()

  const hasFilters = Boolean(debouncedSearch) || status !== 'all' || category !== 'all'
  const products = data?.results ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.count} produit${data.count > 1 ? 's' : ''}` : 'Gérez votre catalogue.'}
            {store?.product_limit && ` · limite du plan : ${store.product_limit}`}
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/products/new">
            <Plus />
            Ajouter un produit
          </Link>
        </Button>
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
            placeholder="Rechercher un produit…"
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
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.public_id} value={cat.public_id}>
                {cat.name}
              </SelectItem>
            ))}
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
        hasFilters ? (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description="Aucun produit ne correspond à votre recherche."
          />
        ) : (
          <EmptyState
            icon={Package}
            title="Aucun produit pour le moment"
            description="Ajoutez votre premier produit pour commencer à vendre. Cela prend moins de 30 secondes."
            action={
              <Button asChild>
                <Link to="/dashboard/products/new">
                  <Plus />
                  Ajouter mon premier produit
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.public_id}>
                  <TableCell>
                    <Link to={`/dashboard/products/${product.public_id}/edit`} className="flex items-center gap-3 group">
                      <div className="size-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                        {product.primary_image_url ? (
                          <img src={product.primary_image_url} alt={product.name} className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Package className="size-4" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium group-hover:text-primary">{product.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.category_name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatMoney(product.price, store?.currency ?? 'XOF')}</span>
                      {product.compare_at_price && Number(product.compare_at_price) > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatMoney(product.compare_at_price, store?.currency ?? 'XOF')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.is_out_of_stock ? (
                      <Badge variant="destructive">Rupture</Badge>
                    ) : product.is_low_stock ? (
                      <Badge variant="warning">{product.total_stock} restants</Badge>
                    ) : (
                      <span className="text-muted-foreground">{product.total_stock}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                      {STATUS_LABELS[product.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/products/${product.public_id}/edit`}>
                            <Pencil />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateProduct.mutate(product.public_id)}>
                          <Copy />
                          Dupliquer
                        </DropdownMenuItem>
                        {product.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => archiveProduct.mutate(product.public_id)}>
                            <Package />
                            Archiver
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem variant="destructive" onClick={() => setProductToDelete(product)}>
                          <Trash2 />
                          Supprimer
                        </DropdownMenuItem>
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

      <AlertDialog open={Boolean(productToDelete)} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {productToDelete?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement retiré de votre boutique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (productToDelete) deleteProduct.mutate(productToDelete.public_id)
                setProductToDelete(null)
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
