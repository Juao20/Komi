import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'

export function FinalCTASection() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center sm:px-16"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, oklch(0.54 0.22 285) 0%, transparent 45%), radial-gradient(circle at 80% 80%, oklch(0.45 0.18 300) 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Prêt à vendre plus facilement ?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/70">
            Rejoignez les commerçants qui utilisent déjà KOMI pour développer leur activité.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-8">
            <Link to="/register">
              Créer ma boutique gratuitement
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
