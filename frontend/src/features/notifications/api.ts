import type { Notification } from '@/features/notifications/types'
import { apiClient } from '@/shared/services/api-client'
import type { Paginated } from '@/shared/types/api'

export async function fetchNotifications() {
  const { data } = await apiClient.get<Paginated<Notification> & { unread_count: number }>('/notifications/')
  return data
}

export async function markNotificationRead(publicId: string) {
  const { data } = await apiClient.post<Notification>(`/notifications/${publicId}/read/`)
  return data
}

export async function markAllNotificationsRead() {
  await apiClient.post('/notifications/read-all/')
}
