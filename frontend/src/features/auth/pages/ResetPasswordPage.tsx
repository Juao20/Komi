import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { useConfirmPasswordReset } from '@/features/auth/hooks'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

const schema = z.object({ new_password: z.string().min(8, 'Au moins 8 caractères.') })
type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') ?? ''
  const token = searchParams.get('token') ?? ''
  const confirmReset = useConfirmPasswordReset()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (confirmReset.isSuccess) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Mot de passe mis à jour</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vous pouvez maintenant vous connecter.</p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Choisissez un mot de passe sécurisé.</p>

      <form
        onSubmit={handleSubmit((values) => confirmReset.mutate({ uid, token, new_password: values.new_password }))}
        className="mt-8 space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="new_password">Nouveau mot de passe</Label>
          <Input id="new_password" type="password" autoComplete="new-password" {...register('new_password')} aria-invalid={Boolean(errors.new_password)} />
          {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={confirmReset.isPending}>
          {confirmReset.isPending && <Loader2 className="animate-spin" />}
          Réinitialiser le mot de passe
        </Button>
      </form>
    </div>
  )
}
