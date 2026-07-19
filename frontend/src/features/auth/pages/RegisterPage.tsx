import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useLogin, useRegister } from '@/features/auth/hooks'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Entrez votre nom complet.'),
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(8, 'Au moins 8 caractères.'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useRegister()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = (values: RegisterFormValues) => {
    registerUser.mutate(values, {
      onSuccess: () => {
        login.mutate(
          { email: values.email, password: values.password },
          { onSuccess: () => navigate('/onboarding', { replace: true }) },
        )
      },
    })
  }

  const isSubmitting = registerUser.isPending || login.isPending

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Créez votre compte</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Votre boutique en ligne vous attend. Ça prend moins de 5 minutes.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input id="full_name" autoComplete="name" placeholder="Amina Diallo" {...register('full_name')} aria-invalid={Boolean(errors.full_name)} />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="vous@boutique.com" {...register('email')} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} aria-invalid={Boolean(errors.password)} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
