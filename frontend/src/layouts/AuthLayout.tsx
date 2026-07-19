import { motion } from 'framer-motion'
import { Link, Outlet } from 'react-router-dom'

import { Logo } from '@/shared/components/Logo'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 sm:p-12">
        <Link to="/">
          <Logo variant="primary" className="h-9" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mx-auto w-full max-w-sm"
        >
          <Outlet />
        </motion.div>

        <p className="text-center text-xs text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} KOMI. Le moyen le plus simple de vendre en ligne.
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, oklch(0.54 0.22 285) 0%, transparent 45%), radial-gradient(circle at 80% 80%, oklch(0.45 0.18 300) 0%, transparent 50%), oklch(0.16 0.02 285)',
          }}
        />
        <div className="relative z-10 flex h-full flex-col items-start justify-end p-16">
          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-md text-3xl font-medium leading-tight text-white"
          >
            « Toute votre activité au même endroit. »
          </motion.blockquote>
          <p className="mt-4 text-sm text-white/60">
            Des milliers de commerçants africains font confiance à KOMI pour vendre en ligne.
          </p>
        </div>
      </div>
    </div>
  )
}
