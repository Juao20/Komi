import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'

import { ADMIN_NAV_ITEMS } from '@/layouts/components/admin-nav-items'
import { Logo } from '@/shared/components/Logo'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/utils/cn'

const itemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
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
  icon: ComponentType<{ className?: string }>
  end?: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink to={to} end={end} className={itemClass} onClick={onNavigate}>
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="admin-sidebar-active-pill"
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

export function AdminSidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 px-5">
        <Logo />
        <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          Retour à mon compte
        </NavLink>
      </div>
    </>
  )
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <AdminSidebarNavContent />
    </aside>
  )
}
