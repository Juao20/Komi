import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bot, Clock, DollarSign, Zap } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { useAdminComyUsage } from '@/features/backoffice/hooks'
import { StatCard } from '@/shared/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { formatNumber } from '@/shared/utils/format'

const FEATURE_LABELS: Record<string, string> = {
  health_explain: 'Explication du score de santé',
  daily_briefing: 'Briefing quotidien',
  product_analysis: 'Analyse produit',
  merchant_chat: 'Chat commerçant',
  buyer_chat: 'Chat acheteur',
}

export function AdminComyPage() {
  const [days, setDays] = useState(30)
  const { data, isPending } = useAdminComyUsage(days)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Comy"
        description="Usage de l'assistant IA — toutes les statistiques sont calculées côté Django."
        action={
          <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isPending || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Appels totaux" value={formatNumber(data.total_calls)} icon={Bot} delay={0} />
            <StatCard label="Taux de cache" value={`${data.cache_hit_rate}%`} icon={Zap} delay={0.05} />
            <StatCard label="Latence moyenne" value={`${data.avg_duration_ms} ms`} icon={Clock} delay={0.1} />
            <StatCard label="Coût estimé" value={`$${data.estimated_cost_usd}`} icon={DollarSign} delay={0.15} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Appels par jour</CardTitle>
            </CardHeader>
            <CardContent>
              {data.daily_series.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucune activité sur la période.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.daily_series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(value) => format(parseISO(value), 'd MMM', { locale: fr })}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                      minTickGap={24}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const point = payload[0].payload as { day: string; calls: number; tokens: number }
                        return (
                          <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elevation-medium">
                            <p className="font-medium text-popover-foreground">
                              {format(parseISO(point.day), 'd MMMM yyyy', { locale: fr })}
                            </p>
                            <p className="mt-1 text-muted-foreground">
                              {point.calls} appel{point.calls > 1 ? 's' : ''} · {formatNumber(point.tokens)} tokens
                            </p>
                          </div>
                        )
                      }}
                      cursor={{ fill: 'var(--color-secondary)' }}
                    />
                    <Bar dataKey="calls" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par fonctionnalité</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.by_feature.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-muted-foreground">Aucun appel sur la période.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fonctionnalité</TableHead>
                      <TableHead>Appels</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.by_feature.map((row) => (
                      <TableRow key={row.feature}>
                        <TableCell className="font-medium">{FEATURE_LABELS[row.feature] ?? row.feature}</TableCell>
                        <TableCell>{formatNumber(row.calls)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.tokens)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
