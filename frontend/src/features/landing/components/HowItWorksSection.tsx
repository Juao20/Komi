import { motion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    title: 'Créez votre boutique',
    description: 'Renseignez le nom, le secteur et les couleurs de votre boutique. Elle est créée automatiquement.',
  },
  {
    number: '02',
    title: 'Ajoutez vos produits',
    description: 'Photos, prix, stock — ajoutez votre catalogue en quelques minutes.',
  },
  {
    number: '03',
    title: 'Partagez et vendez',
    description: 'Partagez votre lien sur WhatsApp et vos réseaux, et recevez vos premières commandes.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-secondary/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Comment ça marche</h2>
          <p className="mt-4 text-muted-foreground">Trois étapes. Aucune compétence technique requise.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              <span className="text-5xl font-semibold text-primary/15">{step.number}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
