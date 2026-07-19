import { motion } from 'framer-motion'
import { ArrowUpRight, Package, ShoppingBag, Users } from 'lucide-react'

const BARS = [40, 65, 45, 80, 55, 90, 70]

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-high"
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-warning/50" />
        <span className="size-2.5 rounded-full bg-success/50" />
        <span className="ml-3 text-xs text-muted-foreground">amina-boutique.komi.shop/dashboard</span>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Chiffre d\'affaires', value: '2 450 000', icon: ArrowUpRight, delta: '+18%' },
            { label: 'Commandes', value: '184', icon: ShoppingBag, delta: '+9%' },
            { label: 'Clients', value: '96', icon: Users, delta: '+12%' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                <stat.icon className="size-3 text-primary" />
              </div>
              <p className="mt-1.5 text-sm font-semibold">{stat.value}</p>
              <p className="text-[10px] font-medium text-success">{stat.delta}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Évolution des ventes</p>
            <Package className="size-3.5 text-muted-foreground" />
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {BARS.map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.06, ease: 'easeOut' }}
                className="flex-1 rounded-md bg-primary/70"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {[
            { name: 'Robe Wax Élégante', amount: '15 000 FCFA', status: 'Confirmée' },
            { name: 'Sac à main Cuir', amount: '28 000 FCFA', status: 'En attente' },
          ].map((order) => (
            <div key={order.name} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-xs font-medium">{order.name}</span>
              <span className="text-xs text-muted-foreground">{order.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
