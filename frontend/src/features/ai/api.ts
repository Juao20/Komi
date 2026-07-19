import type { AIMessage, DailyBriefing, HealthScore } from '@/features/ai/types'
import { apiClient } from '@/shared/services/api-client'

export async function fetchHealthScore(explain = false) {
  const { data } = await apiClient.get<HealthScore>('/ai/health-score/', { params: explain ? { explain: 'true' } : {} })
  return data
}

export async function fetchDailyBriefing() {
  const { data } = await apiClient.get<DailyBriefing>('/ai/daily-briefing/')
  return data
}

export async function refreshDailyBriefing() {
  const { data } = await apiClient.post<DailyBriefing>('/ai/daily-briefing/')
  return data
}

export async function fetchProductAnalysis(productPublicId: string) {
  const { data } = await apiClient.get<{ analysis: string }>(`/ai/products/${productPublicId}/analysis/`)
  return data
}

export async function fetchChatHistory() {
  const { data } = await apiClient.get<AIMessage[]>('/ai/chat/')
  return data
}

export async function sendChatMessage(question: string) {
  const { data } = await apiClient.post<{ answer: string }>('/ai/chat/', { question })
  return data
}

export async function sendBuyerChatMessage(slug: string, question: string, sessionKey: string) {
  const { data } = await apiClient.post<{ answer: string }>(`/public/stores/${slug}/ai/chat/`, {
    question,
    session_key: sessionKey,
  })
  return data
}
