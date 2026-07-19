import { formatDistanceToNowStrict } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, CheckCheck, Inbox } from 'lucide-react'

import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'

export function NotificationsDropdown() {
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = data?.unread_count ?? 0
  const notifications = data?.results ?? []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="size-3.5" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Inbox className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.public_id}
                onClick={() => !notification.is_read && markRead.mutate(notification.public_id)}
                className={cn(
                  'flex w-full flex-col gap-0.5 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-secondary/60',
                  !notification.is_read && 'bg-primary/5',
                )}
              >
                <div className="flex items-center gap-2">
                  {!notification.is_read && <span className="size-1.5 rounded-full bg-primary" />}
                  <p className="text-sm font-medium">{notification.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                </p>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
