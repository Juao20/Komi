import { motion } from 'framer-motion'
import { BarChart3, Bell, Globe, Package, ShoppingBag, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: ShoppingBag,
    title: 'Boutique en ligne instantanée',
    description: 'Créez une boutique professionnelle en moins de 5 minutes, sans compétences techniques.',
  },
  {
    icon: Package,
    title: 'Gestion de produits simple',
    description: 'Ajoutez vos produits en 30 secondes, avec photos, prix et stock.',
  },
  {
    icon: Bell,
    title: 'Commandes centralisées',
    description: 'Recevez et suivez toutes vos commandes au même endroit, du paiement à la livraison.',
  },
  {
    icon: Users,
    title: 'Clients automatiquement suivis',
    description: 'Chaque commande enrichit votre base de clients, sans saisie manuelle.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques claires',
    description: 'Chiffre d\'affaires, panier moyen, produits populaires — comprenez votre activité d\'un coup d\'œil.',
  },
  {
    icon: Globe,
    title: 'Partage instantané',
    description: 'Un lien unique à partager sur WhatsApp, Instagram, TikTok ou Facebook.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tout ce qu'il faut pour vendre</h2>
        <p className="mt-4 text-muted-foreground">
          KOMI n'est pas un simple créateur de boutique. C'est un système complet pour vous aider à vendre plus,
          plus vite.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
            className="rounded-2xl border border-border p-6 transition-shadow hover:shadow-elevation-medium"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <feature.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
