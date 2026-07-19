import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ExternalLink, Loader2, Rocket } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useMyStore, usePublishStore, useUpdateStore } from '@/features/store/hooks'
import { COUNTRIES, CURRENCIES, SECTORS } from '@/features/store/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Textarea } from '@/shared/components/ui/textarea'

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  sector: z.string(),
  country: z.string(),
  currency: z.string(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  social_facebook: z.string().optional(),
  social_instagram: z.string().optional(),
  social_tiktok: z.string().optional(),
  social_whatsapp: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function StoreSettingsPage() {
  const { data: store, isPending } = useMyStore()
  const updateStore = useUpdateStore()
  const publishStore = usePublishStore()

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sector: '', country: '', currency: '' },
  })

  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        description: store.description,
        sector: store.sector,
        country: store.country,
        currency: store.currency,
        phone_number: store.phone_number,
        email: store.email,
        address: store.address,
        city: store.city,
        social_facebook: store.social_facebook,
        social_instagram: store.social_instagram,
        social_tiktok: store.social_tiktok,
        social_whatsapp: store.social_whatsapp,
      })
    }
  }, [store, reset])

  if (isPending || !store) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((values) => updateStore.mutate(values))} className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Boutique</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gérez les informations publiques de votre boutique.</p>
        </div>
        <div className="flex items-center gap-2">
          {store.is_published ? (
            <Badge variant="success">
              <Check className="size-3" />
              Publiée
            </Badge>
          ) : (
            <Button type="button" size="sm" onClick={() => publishStore.mutate()} disabled={publishStore.isPending}>
              {publishStore.isPending ? <Loader2 className="animate-spin" /> : <Rocket />}
              Publier ma boutique
            </Button>
          )}
          {store.is_published && (
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={`/s/${store.slug}`} target="_blank" rel="noreferrer">
                Voir <ExternalLink />
              </a>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" {...register('name')} />
            </div>
            <div className="space-y-1.5">
              <Label>Secteur</Label>
              <Select value={watch('sector')} onValueChange={(value) => value && setValue('sector', value)}>
                <SelectTrigger>
                  <SelectValue>{SECTORS.find((s) => s.value === watch('sector'))?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Téléphone</Label>
              <Input id="phone_number" {...register('phone_number')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
            <div className="space-y-1.5">
              <Label>Pays</Label>
              <Select value={watch('country')} onValueChange={(value) => value && setValue('country', value)}>
                <SelectTrigger>
                  <SelectValue>{COUNTRIES.find((c) => c.value === watch('country'))?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Devise</Label>
              <Select value={watch('currency')} onValueChange={(value) => value && setValue('currency', value)}>
                <SelectTrigger>
                  <SelectValue>{CURRENCIES.find((c) => c.value === watch('currency'))?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...register('city')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" {...register('address')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="social_whatsapp">WhatsApp</Label>
              <Input id="social_whatsapp" placeholder="+225 07 00 00 00 00" {...register('social_whatsapp')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="social_instagram">Instagram</Label>
              <Input id="social_instagram" placeholder="@maboutique" {...register('social_instagram')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="social_facebook">Facebook</Label>
              <Input id="social_facebook" {...register('social_facebook')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="social_tiktok">TikTok</Label>
              <Input id="social_tiktok" placeholder="@maboutique" {...register('social_tiktok')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button type="submit" disabled={updateStore.isPending}>
          {updateStore.isPending && <Loader2 className="animate-spin" />}
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  )
}
