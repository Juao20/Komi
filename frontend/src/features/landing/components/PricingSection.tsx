import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    description: 'Pour démarrer et tester KOMI.',
    features: ['1 boutique', '20 produits', 'Statistiques de base', 'Sous-domaine KOMI'],
  },
  {
    name: 'Starter',
    price: '9 000',
    description: 'Pour les commerçants qui grandissent.',
    features: ['Produits illimités', 'Domaine personnalisé', 'Statistiques avancées'],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '25 000',
    description: 'Pour vendre à grande échelle.',
    features: ['Multi-utilisateurs', 'Automatisations', 'Assistant IA'],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-secondary/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Des tarifs simples et transparents</h2>
          <p className="mt-4 text-muted-foreground">Commencez gratuitement. Évoluez quand vous en avez besoin.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={cn(
                'relative rounded-2xl border bg-card p-8',
                plan.highlighted ? 'border-primary shadow-elevation-high' : 'border-border',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Le plus populaire
                </span>
              )}
              <p className="font-semibold">{plan.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-5 text-4xl font-semibold tracking-tight">
                {plan.price} <span className="text-sm font-normal text-muted-foreground">FCFA/mois</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={plan.highlighted ? 'default' : 'outline'}>
                <Link to="/register">Commencer</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
