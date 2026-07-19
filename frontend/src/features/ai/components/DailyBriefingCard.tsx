import { AlertTriangle, CheckCircle2, Loader2, Package, RefreshCw } from 'lucide-react'
import type { ComponentType } from 'react'

import { useDailyBriefing, useRefreshDailyBriefing } from '@/features/ai/hooks'
import { ComyIcon } from '@/shared/components/ComyIcon'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

const TIP_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  package: Package,
  alert: AlertTriangle,
  warning: AlertTriangle,
  check: CheckCircle2,
}
const DEFAULT_TIP_ICON = ComyIcon

export function DailyBriefingCard() {
  const { data, isPending } = useDailyBriefing()
  const refresh = useRefreshDailyBriefing()

  if (isPending || !data) {
    return <Skeleton className="h-48 rounded-xl" />
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <ComyIcon className="size-4" />
          Résumé de Comy
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => refresh.mutate()} disabled={refresh.isPending}>
          {refresh.isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">{data.narrative}</p>

        {data.tips.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {data.tips.map((tip, index) => {
              const Icon = TIP_ICONS[tip.icon] ?? DEFAULT_TIP_ICON
              return (
                <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Icon className="mt-0.5 size-3.5 shrink-0" />
                  <span>{tip.message}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
