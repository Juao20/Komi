import { AdminPageHeader } from '@/features/backoffice/components/AdminPageHeader'
import { useAdminPlatformSettings } from '@/features/backoffice/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatMoney } from '@/shared/utils/format'

export function AdminSettingsPage() {
  const { data, isPending } = useAdminPlatformSettings()

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Paramètres" description="Configuration actuelle de la plateforme (lecture seule)." />

      {isPending || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Fournisseurs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SettingRow label="Fournisseur IA (Comy)" value={data.ai_provider} />
              <SettingRow label="Fournisseur email" value={data.email_provider} />
              <SettingRow label="Fournisseur de paiement" value={data.payment_provider} />
              <SettingRow label="Environnement FedaPay" value={data.fedapay_environment} />
              <SettingRow label="Domaine des boutiques" value={`*.${data.store_domain_suffix}`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarifs des plans</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(data.plan_prices).map(([plan, price]) => (
                <SettingRow key={plan} label={plan} value={formatMoney(price, 'XOF')} />
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize">{value}</p>
    </div>
  )
}
