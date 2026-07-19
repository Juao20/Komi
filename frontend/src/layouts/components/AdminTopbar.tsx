import { LogOut, Menu } from 'lucide-react'

import { useLogout, useMe } from '@/features/auth/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { initials } from '@/shared/utils/format'

export function AdminTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { data: user } = useMe()
  const logout = useLogout()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileNav}>
        <Menu className="size-5" />
      </Button>

      <span className="text-sm font-medium text-foreground">Back office KOMI</span>

      <div className="ml-auto flex items-center gap-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar>
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()}>
                <LogOut />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
