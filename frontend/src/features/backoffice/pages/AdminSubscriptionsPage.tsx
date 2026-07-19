import { CreditCard, TrendingUp } from 'lucide-react'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { PlanBadge } from '@/features/backoffice/components/StatusBadges'
import { useAdminSubscriptions } from '@/features/backoffice/hooks'
import { StatCard } from '@/shared/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { formatMoney, formatNumber } from '@/shared/utils/format'

export function AdminSubscriptionsPage() {
  const { data, isPending } = useAdminSubscriptions()

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Abonnements" description="Répartition des boutiques par plan et revenu récurrent." />

      {isPending || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Revenu récurrent mensuel (MRR)" value={formatMoney(data.mrr, 'XOF')} icon={TrendingUp} delay={0} />
            <StatCard label="Revenu récurrent annuel (ARR)" value={formatMoney(data.mrr * 12, 'XOF')} icon={CreditCard} delay={0.05} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par plan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Prix mensuel</TableHead>
                    <TableHead>Boutiques</TableHead>
                    <TableHead className="text-right">MRR généré</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.breakdown.map((row) => (
                    <TableRow key={row.plan}>
                      <TableCell>
                        <PlanBadge plan={row.plan} />
                      </TableCell>
                      <TableCell>{formatMoney(row.price, 'XOF')}</TableCell>
                      <TableCell>{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-right font-medium">{formatMoney(row.mrr, 'XOF')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
