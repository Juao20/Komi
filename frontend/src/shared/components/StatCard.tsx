import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { ComponentType } from 'react'

import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils/cn'

interface StatCardProps {
  label: string
  value: string
  growthPct?: number
  icon: ComponentType<{ className?: string }>
  delay?: number
}

export function StatCard({ label, value, growthPct, icon: Icon, delay = 0 }: StatCardProps) {
  const isPositive = (growthPct ?? 0) >= 0

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      <Card className="p-5 transition-shadow hover:shadow-elevation-medium">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        {growthPct !== undefined && (
          <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', isPositive ? 'text-success' : 'text-destructive')}>
            {isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            <span>{Math.abs(growthPct).toFixed(1)}%</span>
            <span className="font-normal text-muted-foreground">vs période précédente</span>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
