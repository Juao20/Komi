import { ExternalLink, Menu, Search } from 'lucide-react'

import { NotificationsDropdown } from '@/features/notifications/components/NotificationsDropdown'
import { useMyStore } from '@/features/store/hooks'
import { UserMenu } from '@/layouts/components/UserMenu'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { data: store } = useMyStore()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav}>
        <Menu className="size-5" />
      </Button>

      <div className="hidden items-center gap-2 sm:flex">
        <div className="size-2 rounded-full bg-success" />
        <span className="text-sm font-medium text-foreground">{store?.name}</span>
      </div>

      <div className="relative ml-2 hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher un produit, une commande…" className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {store?.is_published && (
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <a href={`/s/${store.slug}`} target="_blank" rel="noreferrer">
              Voir ma boutique
              <ExternalLink />
            </a>
          </Button>
        )}
        <NotificationsDropdown />
        <UserMenu />
      </div>
    </header>
  )
}
