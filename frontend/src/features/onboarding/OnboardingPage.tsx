import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useCreateStore } from '@/features/store/hooks'
import { COUNTRIES, CURRENCIES, SECTORS } from '@/features/store/types'
import { Logo } from '@/shared/components/Logo'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/utils/cn'
import { slugify } from '@/shared/utils/slugify'

const schema = z.object({
  name: z.string().min(2, 'Donnez un nom à votre boutique.'),
  sector: z.string().min(1, 'Choisissez un secteur.'),
  country: z.string().min(1, 'Choisissez un pays.'),
  currency: z.string().min(1, 'Choisissez une devise.'),
  phone_number: z.string().min(6, 'Numéro de téléphone requis.'),
  description: z.string().max(500).optional(),
  primary_color: z.string(),
  slug: z
    .string()
    .min(3, 'Au moins 3 caractères.')
    .regex(/^[a-z0-9-]+$/, 'Lettres minuscules, chiffres et tirets uniquement.'),
})

type FormValues = z.infer<typeof schema>

const STEPS = [
  { id: 'identity', title: 'Votre boutique', fields: ['name', 'sector'] as const },
  { id: 'contact', title: 'Coordonnées', fields: ['country', 'currency', 'phone_number'] as const },
  { id: 'presentation', title: 'Présentation', fields: ['description', 'primary_color'] as const },
  { id: 'domain', title: 'Votre lien', fields: ['slug'] as const },
]

const COLOR_PRESETS = ['#6C5CE7', '#111827', '#0EA5E9', '#F97316', '#DC2626', '#059669', '#DB2777']

export function OnboardingPage() {
  const navigate = useNavigate()
  const createStore = useCreateStore()
  const [stepIndex, setStepIndex] = useState(0)
  const [slugTouched, setSlugTouched] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { primary_color: '#6C5CE7', currency: 'XOF' },
  })

  const name = watch('name')
  const primaryColor = watch('primary_color')
  const step = STEPS[stepIndex]

  if (name && !slugTouched) {
    const suggested = slugify(name)
    if (watch('slug') !== suggested) setValue('slug', suggested)
  }

  const goNext = async () => {
    const valid = await trigger(step.fields as unknown as (keyof FormValues)[])
    if (!valid) return
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((index) => index + 1)
    } else {
      handleSubmit(onSubmit)()
    }
  }

  const onSubmit = (values: FormValues) => {
    createStore.mutate(values, {
      onSuccess: () => {
        navigate('/dashboard', { replace: true })
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center">
          <Logo variant="primary" className="h-10" />
        </div>

        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  index < stepIndex && 'bg-primary text-primary-foreground',
                  index === stepIndex && 'bg-primary/15 text-primary ring-2 ring-primary',
                  index > stepIndex && 'bg-secondary text-muted-foreground',
                )}
              >
                {index < stepIndex ? <Check className="size-3.5" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevation-medium">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <h1 className="text-xl font-semibold tracking-tight">{step.title}</h1>

              {step.id === 'identity' && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nom de la boutique</Label>
                    <Input id="name" placeholder="Amina Boutique" {...register('name')} aria-invalid={Boolean(errors.name)} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Secteur d'activité</Label>
                    <Select onValueChange={(value) => setValue('sector', value, { shouldValidate: true })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector.value} value={sector.value}>
                            {sector.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sector && <p className="text-xs text-destructive">{errors.sector.message}</p>}
                  </div>
                </div>
              )}

              {step.id === 'contact' && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Pays</Label>
                      <Select onValueChange={(value) => setValue('country', value, { shouldValidate: true })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Devise</Label>
                      <Select defaultValue="XOF" onValueChange={(value) => setValue('currency', value, { shouldValidate: true })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Devise" />
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
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_number">Téléphone</Label>
                    <Input id="phone_number" placeholder="+225 07 00 00 00 00" {...register('phone_number')} aria-invalid={Boolean(errors.phone_number)} />
                    {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
                  </div>
                </div>
              )}

              {step.id === 'presentation' && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea id="description" rows={3} placeholder="Décrivez votre boutique en une phrase…" {...register('description')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Couleur principale</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setValue('primary_color', color)}
                          className={cn(
                            'size-8 rounded-full border-2 transition-transform hover:scale-110',
                            primaryColor === color ? 'border-foreground' : 'border-transparent',
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={color}
                        />
                      ))}
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(event) => setValue('primary_color', event.target.value)}
                        className="size-8 cursor-pointer rounded-full border border-border bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step.id === 'domain' && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="slug">Adresse de votre boutique</Label>
                    <div className="flex items-center overflow-hidden rounded-md border border-input shadow-elevation-low focus-within:ring-2 focus-within:ring-ring">
                      <Input
                        id="slug"
                        className="rounded-none border-0 shadow-none focus-visible:ring-0"
                        {...register('slug', {
                          onChange: () => setSlugTouched(true),
                        })}
                        aria-invalid={Boolean(errors.slug)}
                      />
                      <span className="whitespace-nowrap bg-secondary px-3 py-2 text-sm text-muted-foreground">
                        .komi.shop
                      </span>
                    </div>
                    {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                    <p className="text-xs text-muted-foreground">Vous pourrez connecter un domaine personnalisé plus tard.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              className={cn(stepIndex === 0 && 'invisible')}
            >
              <ArrowLeft />
              Précédent
            </Button>
            <Button type="button" onClick={goNext} disabled={createStore.isPending}>
              {createStore.isPending && <Loader2 className="animate-spin" />}
              {stepIndex === STEPS.length - 1 ? 'Créer ma boutique' : 'Continuer'}
              {stepIndex < STEPS.length - 1 && <ArrowRight />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
