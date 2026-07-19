import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle2, FileWarning, XCircle } from 'lucide-react'
import { useState } from 'react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { ReportStatusBadge } from '@/features/backoffice/components/StatusBadges'
import { useAdminReports, useDismissReport, useResolveReport } from '@/features/backoffice/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'

const REASON_LABELS: Record<string, string> = {
  counterfeit: 'Contrefaçon',
  inappropriate: 'Contenu inapproprié',
  misleading: 'Description trompeuse',
  scam: 'Arnaque suspectée',
  other: 'Autre',
}

export function AdminReportsPage() {
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const params = { status: status === 'all' ? undefined : status, page }
  const { data, isPending } = useAdminReports(params)
  const resolveReport = useResolveReport()
  const dismissReport = useDismissReport()

  const reports = data?.results ?? []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Signalements"
        description={data ? `${data.count} signalement${data.count > 1 ? 's' : ''}` : 'Produits signalés par les acheteurs.'}
        action={
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="reviewed">Examiné</SelectItem>
              <SelectItem value="dismissed">Rejeté</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState icon={FileWarning} title="Aucun signalement" description="Aucun produit n'a été signalé pour le moment." />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.public_id}>
                  <TableCell className="font-medium">{report.product_name}</TableCell>
                  <TableCell className="text-muted-foreground">{report.store_name}</TableCell>
                  <TableCell className="text-muted-foreground">{REASON_LABELS[report.reason] ?? report.reason}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{report.message || '—'}</TableCell>
                  <TableCell>
                    <ReportStatusBadge status={report.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(report.created_at), 'd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => resolveReport.mutate(report.public_id)}>
                          <CheckCircle2 className="size-4 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => dismissReport.mutate(report.public_id)}>
                          <XCircle className="size-4 text-destructive" />
                        </Button>
                      </div>
                    )}
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
