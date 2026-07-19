import { useQuery } from '@tanstack/react-query'

import * as analyticsApi from '@/features/analytics/api'
import { useAuthStore } from '@/features/auth/store'

export function useDashboardOverview(days = 30) {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: ['analytics', 'dashboard', days],
    queryFn: () => analyticsApi.fetchDashboardOverview(days),
    enabled: Boolean(accessToken),
  })
}
