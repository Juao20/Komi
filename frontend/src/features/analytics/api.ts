import type { DashboardOverview } from '@/features/analytics/types'
import { apiClient } from '@/shared/services/api-client'

export async function fetchDashboardOverview(days: number) {
  const { data } = await apiClient.get<DashboardOverview>('/analytics/dashboard/', { params: { days } })
  return data
}
