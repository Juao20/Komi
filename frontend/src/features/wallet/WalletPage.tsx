import { Clock, PiggyBank, TrendingUp, Wallet as WalletIcon } from 'lucide-react'

import { WALLET_TRANSACTION_LABELS, WITHDRAWAL_METHOD_LABELS, WITHDRAWAL_STATUS_LABELS, WITHDRAWAL_STATUS_VARIANTS } from '@/features/wallet/constants'
import { RequestWithdrawalDialog } from '@/features/wallet/components/RequestWithdrawalDialog'
import { useWallet, useWalletTransactions, useWithdrawals } from '@/features/wallet/hooks'
import { EmptyState } from '@/shared/components/EmptyState'
import { StatCard } from '@/shared/components/StatCard'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { formatMoney } from '@/shared/utils/format'

export function WalletPage() {
  const { data: wallet, isPending } = useWallet()
  const { data: transactions } = useWalletTransactions()
  const { data: withdrawals } = useWithdrawals()

  if (isPending || !wallet) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portefeuille</h1>
          <p className="mt-1 text-sm text-muted-foreground">Suivez vos revenus et vos retraits.</p>
        </div>
        <RequestWithdrawalDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Solde disponible" value={formatMoney(wallet.available_balance, wallet.currency)} icon={WalletIcon} delay={0} />
        <StatCard label="Revenus du mois" value={formatMoney(wallet.monthly_revenue, wallet.currency)} icon={TrendingUp} delay={0.05} />
        <StatCard label="En attente" value={formatMoney(wallet.pending_balance, wallet.currency)} icon={Clock} delay={0.1} />
        <StatCard label="Total retiré" value={formatMoney(wallet.total_withdrawn, wallet.currency)} icon={PiggyBank} delay={0.15} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Derniers paiements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!transactions || transactions.results.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState icon={WalletIcon} title="Aucune transaction" description="Vos paiements reçus apparaîtront ici." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.results.map((tx) => (
                  <TableRow key={tx.public_id}>
                    <TableCell className="font-medium">{WALLET_TRANSACTION_LABELS[tx.type] ?? tx.type}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.order_number ? `#${tx.order_number}` : '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.reference}</TableCell>
                    <TableCell className={`text-right font-medium ${Number(tx.amount) < 0 ? 'text-destructive' : 'text-success'}`}>
                      {Number(tx.amount) >= 0 ? '+' : ''}
                      {formatMoney(tx.amount, wallet.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Derniers retraits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!withdrawals || withdrawals.results.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState icon={PiggyBank} title="Aucun retrait" description="Vos demandes de retrait apparaîtront ici." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moyen</TableHead>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.results.map((withdrawal) => (
                  <TableRow key={withdrawal.public_id}>
                    <TableCell className="font-medium">{WITHDRAWAL_METHOD_LABELS[withdrawal.method]}</TableCell>
                    <TableCell className="text-muted-foreground">{withdrawal.mobile_number}</TableCell>
                    <TableCell>
                      <Badge variant={WITHDRAWAL_STATUS_VARIANTS[withdrawal.status]}>
                        {WITHDRAWAL_STATUS_LABELS[withdrawal.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(withdrawal.amount, withdrawal.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
