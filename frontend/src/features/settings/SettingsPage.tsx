import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useChangePassword, useMe, useUpdateProfile } from '@/features/auth/hooks'
import { AppAssetsUploader } from '@/features/settings/components/AppAssetsUploader'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nom requis.'),
  phone_number: z.string().optional(),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Requis.'),
  new_password: z.string().min(8, 'Au moins 8 caractères.'),
})
type PasswordValues = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const { data: user, isPending } = useMe()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (user) profileForm.reset({ full_name: user.full_name, phone_number: user.phone_number })
  }, [user, profileForm])

  if (isPending || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gérez votre profil et votre sécurité.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((values) => updateProfile.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input id="full_name" {...profileForm.register('full_name')} />
              {profileForm.formState.errors.full_name && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Téléphone</Label>
              <Input id="phone_number" {...profileForm.register('phone_number')} />
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((values) =>
              changePassword.mutate(values, { onSuccess: () => passwordForm.reset() }),
            )}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="current_password">Mot de passe actuel</Label>
              <Input id="current_password" type="password" {...passwordForm.register('current_password')} />
              {passwordForm.formState.errors.current_password && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.current_password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_password">Nouveau mot de passe</Label>
              <Input id="new_password" type="password" {...passwordForm.register('new_password')} />
              {passwordForm.formState.errors.new_password && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.new_password.message}</p>
              )}
            </div>
            <Button type="submit" variant="outline" disabled={changePassword.isPending}>
              {changePassword.isPending && <Loader2 className="animate-spin" />}
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ressources KOMI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Envoyez vos logos et visuels de marque pour récupérer leur lien (favicon, réseaux sociaux, emails…).
          </p>
          <AppAssetsUploader />
        </CardContent>
      </Card>
    </div>
  )
}
