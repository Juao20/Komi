import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/features/auth/store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const response = await axios.post<{ access: string }>(`${import.meta.env.VITE_API_URL}/auth/token/refresh/`, {
    refresh: refreshToken,
  })
  useAuthStore.getState().setAccessToken(response.data.access)
  return response.data.access
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && useAuthStore.getState().refreshToken) {
      originalRequest._retried = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const newAccessToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().clearSession()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown } | undefined
    if (typeof data?.detail === 'string') return data.detail
    if (data?.detail && typeof data.detail === 'object') {
      const firstKey = Object.keys(data.detail)[0]
      const firstValue = (data.detail as Record<string, unknown>)[firstKey]
      if (Array.isArray(firstValue)) return String(firstValue[0])
      if (typeof firstValue === 'string') return firstValue
    }
  }
  return fallback
}
