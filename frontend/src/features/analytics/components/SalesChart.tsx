import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import type { SalesPoint } from '@/features/analytics/types'
import { formatMoney } from '@/shared/utils/format'

interface ChartTooltipProps {
  active?: boolean
  payload?: { payload: SalesPoint }[]
  currency: string
}

function ChartTooltip({ active, payload, currency }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elevation-medium">
      <p className="font-medium text-popover-foreground">{format(parseISO(point.day), 'd MMMM yyyy', { locale: fr })}</p>
      <p className="mt-1 text-muted-foreground">
        {formatMoney(point.revenue, currency)} · {point.orders_count} commande{point.orders_count > 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function SalesChart({ data, currency }: { data: SalesPoint[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
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
        <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ stroke: 'var(--color-border)' }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
