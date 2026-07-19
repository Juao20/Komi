import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { SalesChart } from '@/features/analytics/components/SalesChart'
import { useDashboardOverview } from '@/features/analytics/hooks'
import { ORDER_STATUS_LABELS } from '@/features/orders/constants'
import { useMyStore } from '@/features/store/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatMoney, formatNumber } from '@/shared/utils/format'

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--color-warning)',
  confirmed: 'var(--color-primary)',
  processing: 'var(--color-accent-foreground)',
  shipped: 'var(--color-primary)',
  delivered: 'var(--color-success)',
  cancelled: 'var(--color-destructive)',
}

export function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const { data: store } = useMyStore()
  const { data: overview, isPending } = useDashboardOverview(days)
  const currency = store?.currency ?? 'XOF'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Statistiques</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analysez la croissance de votre activité.</p>
        </div>
        <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending || !overview ? (
        <div className="space-y-4">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="mt-2 text-2xl font-semibold">{formatMoney(overview.stats.revenue, currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Panier moyen</p>
                <p className="mt-2 text-2xl font-semibold">{formatMoney(overview.stats.average_order_value, currency)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="mt-2 text-2xl font-semibold">{formatNumber(overview.stats.orders_count)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Évolution des ventes</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.sales_over_time.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Pas encore de données sur cette période.</p>
              ) : (
                <SalesChart data={overview.sales_over_time} currency={currency} />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des commandes</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(overview.order_status_breakdown).length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">Aucune commande.</p>
                ) : (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={Object.entries(overview.order_status_breakdown).map(([status, count]) => ({
                            name: ORDER_STATUS_LABELS[status] ?? status,
                            value: count,
                            status,
                          }))}
                          dataKey="value"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={2}
                        >
                          {Object.keys(overview.order_status_breakdown).map((status) => (
                            <Cell key={status} fill={STATUS_COLORS[status] ?? 'var(--color-muted-foreground)'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 text-sm">
                      {Object.entries(overview.order_status_breakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS[status] ?? 'var(--color-muted-foreground)' }}
                          />
                          <span className="text-muted-foreground">{ORDER_STATUS_LABELS[status] ?? status}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produits populaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview.top_products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune vente sur cette période.</p>
                ) : (
                  overview.top_products.map((product, index) => (
                    <div key={`${product.product_id}-${index}`} className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{product.product_name}</span>
                      <span className="shrink-0 text-muted-foreground">{product.units_sold} vendus</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meilleurs clients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview.best_customers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun client sur cette période.</p>
                ) : (
                  overview.best_customers.map((customer) => (
                    <div key={customer.public_id} className="flex items-center justify-between text-sm">
                      <span className="truncate font-medium">{customer.full_name}</span>
                      <span className="shrink-0 text-muted-foreground">{formatMoney(customer.total_spent, currency)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
