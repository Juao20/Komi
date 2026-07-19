import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

const ROWS = [
  { label: 'Créer une boutique', komi: 'En 5 minutes', others: 'Plusieurs heures, souvent des jours' },
  { label: 'Compétences requises', komi: 'Aucune', others: 'Notions techniques nécessaires' },
  { label: 'Pensé pour', komi: 'Les commerçants africains', others: 'Le e-commerce occidental' },
  { label: 'Philosophie', komi: 'Un outil pour vendre', others: 'Un logiciel à configurer' },
]

export function WhyKomiSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pourquoi KOMI ?</h2>
        <p className="mt-4 text-muted-foreground">
          Shopify est une plateforme e-commerce. KOMI est un outil pour vendre — pensé pour la réalité des
          commerçants africains.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mt-12 overflow-hidden rounded-2xl border border-border"
      >
        <div className="grid grid-cols-3 bg-secondary/40 px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span></span>
          <span className="text-primary">KOMI</span>
          <span>Solutions classiques</span>
        </div>
        {ROWS.map((row, index) => (
          <div key={row.label} className={`grid grid-cols-3 items-center px-6 py-4 ${index !== ROWS.length - 1 ? 'border-b border-border' : ''}`}>
            <span className="text-sm font-medium">{row.label}</span>
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Check className="size-4 shrink-0 text-success" />
              {row.komi}
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <X className="size-4 shrink-0 text-muted-foreground/50" />
              {row.others}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
