import { motion } from 'framer-motion'
import { CreditCard, Package, ShoppingBag, Store, TrendingUp, Users, Wallet } from 'lucide-react'

import { useAdminDashboard } from '@/features/backoffice/hooks'
import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { StatCard } from '@/shared/components/StatCard'
import { formatMoney, formatNumber } from '@/shared/utils/format'

export function AdminDashboardPage() {
  const { data, isPending } = useAdminDashboard()

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Dashboard" description="Vue d'ensemble de la plateforme KOMI." />

      {isPending || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="GMV total" value={formatMoney(data.gmv_total, 'XOF')} icon={TrendingUp} delay={0} />
            <StatCard label="MRR" value={formatMoney(data.mrr, 'XOF')} icon={Wallet} delay={0.05} />
            <StatCard label="ARR" value={formatMoney(data.arr, 'XOF')} icon={CreditCard} delay={0.1} />
            <StatCard label="Panier moyen (AOV)" value={formatMoney(data.aov, 'XOF')} icon={ShoppingBag} delay={0.15} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Boutiques" value={formatNumber(data.total_stores)} icon={Store} delay={0} />
            <StatCard label="Boutiques publiées" value={formatNumber(data.published_stores)} icon={Store} delay={0.05} />
            <StatCard label="Utilisateurs" value={formatNumber(data.total_users)} icon={Users} delay={0.1} />
            <StatCard label="Commandes" value={formatNumber(data.total_orders)} icon={Package} delay={0.15} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <p className="text-sm font-medium text-muted-foreground">CA aujourd'hui</p>
              <p className="mt-2 text-xl font-semibold">{formatMoney(data.revenue_today, 'XOF')}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Commandes aujourd'hui</p>
              <p className="mt-2 text-xl font-semibold">{formatNumber(data.orders_today)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Nouvelles boutiques (7j)</p>
              <p className="mt-2 text-xl font-semibold">{formatNumber(data.new_stores_this_week)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Retraits en attente</p>
              <p className="mt-2 text-xl font-semibold">{formatNumber(data.pending_withdrawals)}</p>
            </Card>
          </div>
        </>
      )}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
    </motion.div>
  )
}
