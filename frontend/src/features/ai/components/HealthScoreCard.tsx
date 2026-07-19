import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { useHealthScore } from '@/features/ai/hooks'
import { ComyIcon } from '@/shared/components/ComyIcon'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/utils/cn'

const LEVEL_COLOR: Record<string, string> = {
  excellent: 'var(--color-success)',
  good: 'var(--color-primary)',
  needs_attention: 'var(--color-warning)',
}

const LEVEL_LABEL: Record<string, string> = {
  excellent: 'Excellent',
  good: 'Bon',
  needs_attention: 'À améliorer',
}

export function HealthScoreCard() {
  const [explain, setExplain] = useState(false)
  const { data, isPending, isFetching } = useHealthScore(explain)

  if (isPending || !data) {
    return <Skeleton className="h-56 rounded-xl" />
  }

  const color = LEVEL_COLOR[data.level]
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (data.score / 100) * circumference

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Health Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0 -rotate-90">
            <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-secondary)" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <text x="48" y="48" textAnchor="middle" dominantBaseline="central" className="rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '48px 48px', fontSize: '22px', fontWeight: 700, fill: 'var(--color-foreground)' }}>
              {data.score}
            </text>
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color }}>
              {LEVEL_LABEL[data.level]}
            </p>
            {!data.explanation ? (
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setExplain(true)} disabled={isFetching}>
                {isFetching ? <Loader2 className="animate-spin" /> : <ComyIcon className="size-4" />}
                Pourquoi ce score ?
              </Button>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">{data.explanation}</p>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4">
          {data.breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">{item.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn('h-full rounded-full bg-primary transition-all')}
                  style={{ width: `${(item.points / item.max) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                {item.points}/{item.max}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
