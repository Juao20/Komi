import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { useAdminAnalytics } from '@/features/backoffice/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatMoney, formatNumber } from '@/shared/utils/format'

export function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data, isPending } = useAdminAnalytics(days)

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description="Activité et engagement sur la période sélectionnée."
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <MetricCard label="Utilisateurs actifs (jour)" value={formatNumber(data.dau)} />
            <MetricCard label="Utilisateurs actifs (semaine)" value={formatNumber(data.wau)} />
            <MetricCard label="Utilisateurs actifs (mois)" value={formatNumber(data.mau)} />
            <MetricCard label="Conversion commande→paiement" value={`${data.conversion_rate}%`} />
            <MetricCard label="Rétention boutiques (30j)" value={`${data.retention_rate}%`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commandes & GMV</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.orders_series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                      const point = payload[0].payload as { day: string; orders: number; gmv: number | null }
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elevation-medium">
                          <p className="font-medium text-popover-foreground">
                            {format(parseISO(point.day), 'd MMMM yyyy', { locale: fr })}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {point.orders} commande{point.orders > 1 ? 's' : ''} · {formatMoney(point.gmv ?? 0, 'XOF')}
                          </p>
                        </div>
                      )
                    }}
                    cursor={{ stroke: 'var(--color-border)' }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="var(--color-primary)" strokeWidth={2} fill="url(#ordersGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nouvelles inscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.signups_series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
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
                      const point = payload[0].payload as { day: string; signups: number }
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elevation-medium">
                          <p className="font-medium text-popover-foreground">
                            {format(parseISO(point.day), 'd MMMM yyyy', { locale: fr })}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {point.signups} inscription{point.signups > 1 ? 's' : ''}
                          </p>
                        </div>
                      )
                    }}
                    cursor={{ fill: 'var(--color-secondary)' }}
                  />
                  <Bar dataKey="signups" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </Card>
  )
}
