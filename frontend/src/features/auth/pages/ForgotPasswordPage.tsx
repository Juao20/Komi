import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { useRequestPasswordReset } from '@/features/auth/hooks'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

const schema = z.object({ email: z.string().email('Adresse email invalide.') })
type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (requestReset.isSuccess) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Vérifiez votre boîte mail</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Si un compte existe avec cette adresse, un lien de réinitialisation vient d'être envoyé.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Entrez votre email, nous vous enverrons un lien de réinitialisation.
      </p>

      <form onSubmit={handleSubmit((values) => requestReset.mutate(values.email))} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="vous@boutique.com" {...register('email')} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={requestReset.isPending}>
          {requestReset.isPending && <Loader2 className="animate-spin" />}
          Envoyer le lien
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
