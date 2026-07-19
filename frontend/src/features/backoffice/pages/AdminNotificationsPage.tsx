import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle2, Clock, Mail, XCircle } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { EmailStatusBadge } from '@/features/backoffice/components/StatusBadges'
import { useAdminEmailLogs, useAdminEmailStats } from '@/features/backoffice/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { StatCard } from '@/shared/components/StatCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { formatNumber } from '@/shared/utils/format'

export function AdminNotificationsPage() {
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const { data: stats } = useAdminEmailStats()
  const params = { status: status === 'all' ? undefined : status, page }
  const { data, isPending } = useAdminEmailLogs(params)
  const logs = data?.results ?? []

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Notifications" description="Suivi de la délivrabilité des emails transactionnels." />

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Emails envoyés" value={formatNumber(stats.total)} icon={Mail} delay={0} />
          <StatCard label="Délivrés" value={formatNumber(stats.sent)} icon={CheckCircle2} delay={0.05} />
          <StatCard label="Échoués" value={formatNumber(stats.failed)} icon={XCircle} delay={0.1} />
          <StatCard label="En file d'attente" value={formatNumber(stats.queued)} icon={Clock} delay={0.15} />
        </div>
      )}

      <div className="flex justify-end">
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="queued">En file</SelectItem>
            <SelectItem value="sent">Envoyé</SelectItem>
            <SelectItem value="failed">Échoué</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Mail} title="Aucun email" description="Aucun email n'a encore été envoyé." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destinataire</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Envoyé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.public_id}>
                  <TableCell className="font-medium">{log.recipient}</TableCell>
                  <TableCell className="text-muted-foreground">{log.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{log.template_name}</TableCell>
                  <TableCell>
                    <EmailStatusBadge status={log.status} />
                  </TableCell>
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
