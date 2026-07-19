import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { CreditCard, Package, Plus, ShoppingBag, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useMe } from '@/features/auth/hooks'
import { useDashboardOverview } from '@/features/analytics/hooks'
import { SalesChart } from '@/features/analytics/components/SalesChart'
import { ActionCenter } from '@/features/dashboard/components/ActionCenter'
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge'
import { useMyStore } from '@/features/store/hooks'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { StatCard } from '@/shared/components/StatCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { formatMoney, formatNumber } from '@/shared/utils/format'

export function DashboardPage() {
  const { data: user } = useMe()
  const { data: store } = useMyStore()
  const { data: overview, isPending } = useDashboardOverview(30)

  const currency = store?.currency ?? 'XOF'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Bonjour {user?.full_name?.split(' ')[0]} 👋
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard/orders">Voir les commandes</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/products/new">
              <Plus />
              Ajouter un produit
            </Link>
          </Button>
        </div>
      </div>

      {overview && <ActionCenter stats={overview.stats} storePublicUrl={store?.public_url} />}

      {isPending || !overview ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Chiffre d'affaires"
              value={formatMoney(overview.stats.revenue, currency)}
              growthPct={overview.stats.revenue_growth_pct}
              icon={CreditCard}
              delay={0}
            />
            <StatCard
              label="Commandes"
              value={formatNumber(overview.stats.orders_count)}
              growthPct={overview.stats.orders_growth_pct}
              icon={ShoppingBag}
              delay={0.05}
            />
            <StatCard label="Clients" value={formatNumber(overview.stats.customers_count)} icon={Users} delay={0.1} />
            <StatCard label="Produits" value={formatNumber(overview.stats.products_count)} icon={Package} delay={0.15} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.sales_over_time.length === 0 ? (
                  <EmptyChartState />
                ) : (
                  <SalesChart data={overview.sales_over_time} currency={currency} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produits populaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overview.top_products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Pas encore de ventes ce mois-ci.</p>
                ) : (
                  overview.top_products.map((product, index) => (
                    <div key={`${product.product_id}-${index}`} className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground">{product.units_sold} vendus</p>
                      </div>
                      <p className="shrink-0 text-sm font-medium">{formatMoney(product.revenue, currency)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Dernières commandes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/orders">Tout voir</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {overview.recent_orders.length === 0 ? (
                <div className="px-6 pb-6">
                  <p className="text-sm text-muted-foreground">
                    Aucune commande pour le moment. Partagez votre boutique pour recevoir vos premières ventes.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.recent_orders.map((order) => (
                      <TableRow key={order.public_id}>
                        <TableCell className="font-medium">#{order.order_number}</TableCell>
                        <TableCell className="text-muted-foreground">{order.customer_name}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatMoney(order.total_amount, order.currency)}</TableCell>
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

function EmptyChartState() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm font-medium">Pas encore de données</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Vos statistiques de vente apparaîtront ici dès votre première commande.
      </p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </motion.div>
  )
}
