import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as notificationsApi from '@/features/notifications/api'
import { useAuthStore } from '@/features/auth/store'

export const notificationKeys = {
  all: ['notifications'] as const,
}

export function useNotifications() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: notificationsApi.fetchNotifications,
    enabled: Boolean(accessToken),
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
