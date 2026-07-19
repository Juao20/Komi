import { Check } from 'lucide-react'

import { useMyStore } from '@/features/store/hooks'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/utils/cn'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    description: 'Pour démarrer et tester KOMI.',
    features: ['1 boutique', '20 produits', 'Statistiques de base', 'Sous-domaine KOMI'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '9 000',
    description: 'Pour les commerçants qui grandissent.',
    features: ['Produits illimités', 'Domaine personnalisé', 'Statistiques avancées', 'Support prioritaire'],
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '25 000',
    description: 'Pour une équipe qui vend à grande échelle.',
    features: ['Toutes les fonctionnalités Starter', 'Multi-utilisateurs', 'Automatisations', 'Assistant IA'],
  },
]

export function BillingPage() {
  const { data: store, isPending } = useMyStore()

  if (isPending || !store) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Facturation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre plan actuel : <span className="font-medium capitalize text-foreground">{store.plan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === store.plan
          return (
            <Card key={plan.id} className={cn('relative', plan.highlighted && 'border-primary shadow-elevation-medium')}>
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Le plus populaire</Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {plan.name}
                  {isCurrent && <Badge variant="success">Actuel</Badge>}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-3xl font-semibold tracking-tight">
                  {plan.price} <span className="text-sm font-normal text-muted-foreground">FCFA/mois</span>
                </p>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={isCurrent ? 'outline' : 'default'} disabled={isCurrent}>
                  {isCurrent ? 'Plan actuel' : 'Bientôt disponible'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
