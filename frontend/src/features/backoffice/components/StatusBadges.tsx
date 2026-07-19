import { Badge, type BadgeProps } from '@/shared/components/ui/badge'

const STORE_STATUS_LABELS: Record<string, string> = { draft: 'Brouillon', published: 'Publiée', suspended: 'Suspendue' }
const STORE_STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  draft: 'secondary',
  published: 'success',
  suspended: 'destructive',
}
export function StoreStatusBadge({ status }: { status: string }) {
  return <Badge variant={STORE_STATUS_VARIANTS[status] ?? 'secondary'}>{STORE_STATUS_LABELS[status] ?? status}</Badge>
}

const PLAN_LABELS: Record<string, string> = { free: 'Free', starter: 'Starter', pro: 'Pro' }
const PLAN_VARIANTS: Record<string, BadgeProps['variant']> = { free: 'secondary', starter: 'default', pro: 'success' }
export function PlanBadge({ plan }: { plan: string }) {
  return <Badge variant={PLAN_VARIANTS[plan] ?? 'secondary'}>{PLAN_LABELS[plan] ?? plan}</Badge>
}

const ORDER_PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
}
const ORDER_PAYMENT_STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  pending: 'secondary',
  paid: 'success',
  failed: 'destructive',
  refunded: 'warning',
}
export function OrderPaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={ORDER_PAYMENT_STATUS_VARIANTS[status] ?? 'secondary'}>
      {ORDER_PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En cours',
  successful: 'Réussi',
  failed: 'Échoué',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
}
const PAYMENT_STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  pending: 'secondary',
  processing: 'default',
  successful: 'success',
  failed: 'destructive',
  cancelled: 'secondary',
  refunded: 'warning',
}
export function PaymentStatusBadge({ status }: { status: string }) {
  return <Badge variant={PAYMENT_STATUS_VARIANTS[status] ?? 'secondary'}>{PAYMENT_STATUS_LABELS[status] ?? status}</Badge>
}

const REPORT_STATUS_LABELS: Record<string, string> = { pending: 'En attente', reviewed: 'Examiné', dismissed: 'Rejeté' }
const REPORT_STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  pending: 'warning',
  reviewed: 'success',
  dismissed: 'secondary',
}
export function ReportStatusBadge({ status }: { status: string }) {
  return <Badge variant={REPORT_STATUS_VARIANTS[status] ?? 'secondary'}>{REPORT_STATUS_LABELS[status] ?? status}</Badge>
}

const EMAIL_STATUS_LABELS: Record<string, string> = { queued: 'En file', sent: 'Envoyé', failed: 'Échoué' }
const EMAIL_STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  queued: 'secondary',
  sent: 'success',
  failed: 'destructive',
}
export function EmailStatusBadge({ status }: { status: string }) {
  return <Badge variant={EMAIL_STATUS_VARIANTS[status] ?? 'secondary'}>{EMAIL_STATUS_LABELS[status] ?? status}</Badge>
}

const LOG_LEVEL_VARIANTS: Record<string, BadgeProps['variant']> = {
  DEBUG: 'secondary',
  INFO: 'default',
  WARNING: 'warning',
  ERROR: 'destructive',
  CRITICAL: 'destructive',
}
export function LogLevelBadge({ level }: { level: string }) {
  return <Badge variant={LOG_LEVEL_VARIANTS[level] ?? 'secondary'}>{level}</Badge>
}

const USER_ACTIVE_VARIANTS: Record<string, BadgeProps['variant']> = { true: 'success', false: 'destructive' }
export function UserActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={USER_ACTIVE_VARIANTS[String(isActive)]}>{isActive ? 'Actif' : 'Suspendu'}</Badge>
}
