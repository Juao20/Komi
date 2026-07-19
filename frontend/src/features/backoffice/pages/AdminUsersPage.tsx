import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MoreHorizontal, Search } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { ExportCsvButton } from '@/features/backoffice/components/ExportCsvButton'
import { UserActiveBadge } from '@/features/backoffice/components/StatusBadges'
import { useActivateUser, useAdminUsers, useSuspendUser } from '@/features/backoffice/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Badge } from '@/shared/components/ui/badge'
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

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search)
  const params = {
    search: debouncedSearch || undefined,
    is_active: isActive === 'all' ? undefined : isActive,
    page,
  }
  const { data, isPending } = useAdminUsers(params)
  const suspendUser = useSuspendUser()
  const activateUser = useActivateUser()

  const users = data?.results ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Utilisateurs"
        description={data ? `${data.count} utilisateur${data.count > 1 ? 's' : ''}` : 'Gérez les comptes de la plateforme.'}
        action={<ExportCsvButton path="/backoffice/users/" params={params} filename="utilisateurs.csv" />}
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
            placeholder="Rechercher un utilisateur…"
            className="pl-9"
          />
        </div>
        <Select value={isActive} onValueChange={(value) => { setIsActive(value); setPage(1) }}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Actifs</SelectItem>
            <SelectItem value="false">Suspendus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Search} title="Aucun résultat" description="Aucun utilisateur ne correspond à votre recherche." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.public_id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.store_name ?? '—'}
                    {user.is_staff && (
                      <Badge variant="default" className="ml-2">
                        Staff
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <UserActiveBadge isActive={user.is_active} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.last_login ? format(parseISO(user.last_login), 'd MMM yyyy', { locale: fr }) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(user.created_at), 'd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.is_active ? (
                          <DropdownMenuItem variant="destructive" onClick={() => suspendUser.mutate(user.public_id)}>
                            Suspendre
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => activateUser.mutate(user.public_id)}>Réactiver</DropdownMenuItem>
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
