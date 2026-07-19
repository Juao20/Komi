import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { AI_NAV_ITEM, NAV_ITEMS, SETTINGS_NAV_ITEMS, STORE_NAV_ITEMS } from '@/layouts/components/nav-items'
import { ComyIcon } from '@/shared/components/ComyIcon'
import { Logo } from '@/shared/components/Logo'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/utils/cn'

const itemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
  )

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onNavigate,
}: {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink to={to} end={end} className={itemClass} onClick={onNavigate}>
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-lg bg-sidebar-accent"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              style={{ zIndex: -1 }}
            />
          )}
          <Icon className="size-4 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onNavigate} />
          ))}
        </div>

        <div>
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/40">Ma boutique</p>
          <div className="mt-2 space-y-1">
            {STORE_NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/40">Compte</p>
          <div className="mt-2 space-y-1">
            {SETTINGS_NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <NavLink
          to={AI_NAV_ITEM.to}
          onClick={onNavigate}
          className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <ComyIcon className="size-4 shrink-0" />
          <span>Comy</span>
          <span className="ml-auto size-1.5 rounded-full bg-success" />
        </NavLink>
      </div>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <SidebarNavContent />
    </aside>
  )
}
