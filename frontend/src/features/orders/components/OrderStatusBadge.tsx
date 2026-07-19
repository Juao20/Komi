import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from '@/features/orders/constants'
import { Badge } from '@/shared/components/ui/badge'

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge variant={ORDER_STATUS_VARIANTS[status] ?? 'secondary'}>{ORDER_STATUS_LABELS[status] ?? status}</Badge>
}
