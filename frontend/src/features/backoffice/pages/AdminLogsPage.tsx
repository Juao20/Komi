import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ScrollText } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { LogLevelBadge } from '@/features/backoffice/components/StatusBadges'
import { useAdminSystemLogs } from '@/features/backoffice/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'

export function AdminLogsPage() {
  const [level, setLevel] = useState('all')
  const [page, setPage] = useState(1)

  const params = { level: level === 'all' ? undefined : level, page }
  const { data, isPending } = useAdminSystemLogs(params)
  const logs = data?.results ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Logs"
        description={data ? `${data.count} entrée${data.count > 1 ? 's' : ''}` : 'Erreurs applicatives capturées automatiquement.'}
        action={
          <Select value={level} onValueChange={(value) => { setLevel(value); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="Aucun log" description="Aucune erreur applicative n'a été enregistrée." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Niveau</TableHead>
                <TableHead className="w-56">Logger</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-40">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <LogLevelBadge level={log.level} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.logger_name}</TableCell>
                  <TableCell className="max-w-lg truncate font-mono text-xs">{log.message}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(log.created_at), 'd MMM yyyy HH:mm', { locale: fr })}
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
