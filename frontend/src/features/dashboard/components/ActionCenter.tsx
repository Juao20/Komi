import { motion } from 'framer-motion'
import { PackageCheck, Share2, TrendingUp } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'

import type { DashboardStats } from '@/features/analytics/types'
import { ComyIcon } from '@/shared/components/ComyIcon'
import { cn } from '@/shared/utils/cn'

interface ActionItem {
  id: string
  icon: ComponentType<{ className?: string }>
  text: string
  tone: 'default' | 'warning' | 'success' | 'primary'
  to?: string
}

export function ActionCenter({ stats, storePublicUrl }: { stats: DashboardStats; storePublicUrl?: string }) {
  const items: ActionItem[] = []

  if (stats.pending_orders_count > 0) {
    items.push({
      id: 'pending-orders',
      icon: PackageCheck,
      text: `${stats.pending_orders_count} commande${stats.pending_orders_count > 1 ? 's' : ''} en attente de confirmation`,
      tone: 'warning',
      to: '/dashboard/orders',
    })
  }

  if (stats.revenue_growth_pct > 0) {
    items.push({
      id: 'growth',
      icon: TrendingUp,
      text: `Vos ventes sont en hausse de ${stats.revenue_growth_pct.toFixed(0)}% ce mois-ci`,
      tone: 'success',
    })
  }

  items.push({
    id: 'share',
    icon: Share2,
    text: 'Pensez à partager votre boutique aujourd’hui',
    tone: 'default',
    to: storePublicUrl,
  })

  items.push({
    id: 'ai',
    icon: ComyIcon,
    text: 'Demander conseil à Comy',
    tone: 'primary',
    to: '/dashboard/ai-assistant',
  })

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {items.map((item, index) => (
        <ActionCard key={item.id} item={item} index={index} />
      ))}
    </div>
  )
}

const TONE_STYLES: Record<ActionItem['tone'], string> = {
  default: 'bg-secondary text-secondary-foreground',
  warning: 'bg-warning/15 text-warning-foreground',
  success: 'bg-success/10 text-success',
  primary: 'bg-primary/10 text-primary',
}

function ActionCard({ item, index }: { item: ActionItem; index: number }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02]',
        TONE_STYLES[item.tone],
      )}
    >
      <item.icon className="size-4 shrink-0" />
      <span className="whitespace-nowrap">{item.text}</span>
    </motion.div>
  )

  if (!item.to) return content

  const isExternal = item.to.startsWith('http')
  if (isExternal) {
    return (
      <a href={item.to} target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }

  return <Link to={item.to}>{content}</Link>
}
