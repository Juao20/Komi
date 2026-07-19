import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRequestWithdrawal, useWallet } from '@/features/wallet/hooks'
import type { WithdrawalMethod } from '@/features/wallet/types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { formatMoney } from '@/shared/utils/format'

const METHODS: { value: WithdrawalMethod; label: string }[] = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'moov_money', label: 'Moov Money' },
  { value: 'celtiis_cash', label: 'Celtiis Cash' },
]

const schema = z.object({
  amount: z.coerce.number().min(1, 'Montant requis.'),
  method: z.enum(['mtn_momo', 'moov_money', 'celtiis_cash'], { error: 'Choisissez un moyen de retrait.' }),
  mobile_number: z.string().min(6, 'Numéro requis.'),
  account_holder_name: z.string().min(2, 'Nom du titulaire requis.'),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

export function RequestWithdrawalDialog() {
  const [open, setOpen] = useState(false)
  const { data: wallet } = useWallet()
  const requestWithdrawal = useRequestWithdrawal()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: { method: 'mtn_momo' } })

  const onSubmit = (values: FormValues) => {
    requestWithdrawal.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Demander un retrait</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demander un retrait</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {wallet && (
            <p className="text-sm text-muted-foreground">
              Solde disponible : <span className="font-medium text-foreground">{formatMoney(wallet.available_balance, wallet.currency)}</span>
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="amount">Montant</Label>
            <Input id="amount" type="number" step="1" {...register('amount')} aria-invalid={Boolean(errors.amount)} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Moyen de retrait</Label>
            <Select value={watch('method')} onValueChange={(value) => setValue('method', value as FormValues['method'])}>
              <SelectTrigger>
                <SelectValue>{METHODS.find((m) => m.value === watch('method'))?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobile_number">Numéro Mobile Money</Label>
            <Input id="mobile_number" placeholder="+229 90 00 00 00" {...register('mobile_number')} aria-invalid={Boolean(errors.mobile_number)} />
            {errors.mobile_number && <p className="text-xs text-destructive">{errors.mobile_number.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account_holder_name">Nom du titulaire</Label>
            <Input id="account_holder_name" {...register('account_holder_name')} aria-invalid={Boolean(errors.account_holder_name)} />
            {errors.account_holder_name && <p className="text-xs text-destructive">{errors.account_holder_name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={requestWithdrawal.isPending}>
              {requestWithdrawal.isPending && <Loader2 className="animate-spin" />}
              Envoyer la demande
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
