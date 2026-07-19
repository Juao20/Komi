import { motion } from 'framer-motion'

const STATS = [
  { value: '5 min', label: 'pour créer sa boutique' },
  { value: '30 sec', label: 'pour ajouter un produit' },
  { value: '10+', label: 'pays africains couverts' },
  { value: '24/7', label: 'boutique toujours ouverte' },
]

export function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 rounded-2xl border border-border bg-card p-8 sm:grid-cols-4 sm:p-12">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="text-center"
          >
            <p className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{stat.value}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
