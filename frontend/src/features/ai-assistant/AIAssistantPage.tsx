import { motion } from 'framer-motion'
import { Image, MessageCircle, Search, Share2 } from 'lucide-react'

import { ComyChatPanel } from '@/features/ai/components/ComyChatPanel'
import { DailyBriefingCard } from '@/features/ai/components/DailyBriefingCard'
import { HealthScoreCard } from '@/features/ai/components/HealthScoreCard'
import { ComyIcon } from '@/shared/components/ComyIcon'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'

const UPCOMING_FEATURES = [
  {
    icon: MessageCircle,
    title: 'Marketing IA',
    description: 'Publications Facebook, Instagram, TikTok et campagnes WhatsApp générées automatiquement.',
    tags: ['Publications', 'Descriptions produits', 'Promotions'],
  },
  {
    icon: Search,
    title: 'SEO & descriptions',
    description: 'Fiches produits optimisées et suggestions de mots-clés pour être mieux trouvé.',
    tags: ['Titres', 'Descriptions', 'Mots-clés'],
  },
  {
    icon: Image,
    title: 'Analyse photo',
    description: 'Comy évalue vos photos produits et suggère des améliorations.',
    tags: ['Qualité image', 'Suggestions'],
  },
  {
    icon: Share2,
    title: 'Publications automatiques',
    description: 'Planifiez et publiez directement sur vos réseaux depuis KOMI.',
    tags: ['Planification', 'Réseaux sociaux'],
  },
]

export function AIAssistantPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 p-8 sm:p-10"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, oklch(0.54 0.22 285 / 0.18) 0%, transparent 50%), radial-gradient(circle at 85% 80%, oklch(0.6 0.18 300 / 0.15) 0%, transparent 55%)',
        }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ComyIcon className="size-3.5" />
          Assistante intelligente
        </span>
        <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Comy, votre employée virtuelle</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Comy analyse votre boutique chaque jour et vous aide à vendre plus. Posez-lui n'importe quelle question sur
          votre activité.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <HealthScoreCard />
          <DailyBriefingCard />
        </div>
        <ComyChatPanel />
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">Prochainement</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UPCOMING_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <Card className="h-full transition-shadow hover:shadow-elevation-medium">
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {feature.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
