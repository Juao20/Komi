import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as aiApi from '@/features/ai/api'
import { useAuthStore } from '@/features/auth/store'

export function useHealthScore(explain = false) {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: ['ai', 'health-score', explain],
    queryFn: () => aiApi.fetchHealthScore(explain),
    enabled: Boolean(accessToken),
    staleTime: 5 * 60_000,
  })
}

export function useDailyBriefing() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: ['ai', 'daily-briefing'],
    queryFn: aiApi.fetchDailyBriefing,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60_000,
  })
}

export function useRefreshDailyBriefing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiApi.refreshDailyBriefing,
    onSuccess: (data) => queryClient.setQueryData(['ai', 'daily-briefing'], data),
  })
}

export function useProductAnalysis(productPublicId?: string) {
  return useMutation({
    mutationFn: () => aiApi.fetchProductAnalysis(productPublicId!),
  })
}

export function useChatHistory() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: ['ai', 'chat-history'],
    queryFn: aiApi.fetchChatHistory,
    enabled: Boolean(accessToken),
  })
}

export function useSendChatMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiApi.sendChatMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'chat-history'] }),
  })
}
