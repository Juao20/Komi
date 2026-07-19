import type { AuthTokens, User } from '@/features/auth/types'
import { apiClient } from '@/shared/services/api-client'

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  phone_number?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export async function registerRequest(payload: RegisterPayload) {
  const { data } = await apiClient.post<User>('/auth/register/', payload)
  return data
}

export async function loginRequest(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthTokens & { user: User }>('/auth/login/', payload)
  return data
}

export async function logoutRequest(refresh: string) {
  await apiClient.post('/auth/logout/', { refresh })
}

export async function fetchMe() {
  const { data } = await apiClient.get<User>('/auth/me/')
  return data
}

export async function updateMe(payload: Partial<Pick<User, 'full_name' | 'phone_number' | 'avatar_url'>>) {
  const { data } = await apiClient.patch<User>('/auth/me/', payload)
  return data
}

export async function verifyEmailRequest(payload: { uid: string; token: string }) {
  const { data } = await apiClient.post<User>('/auth/verify-email/', payload)
  return data
}

export async function resendVerificationEmailRequest() {
  await apiClient.post('/auth/verify-email/resend/')
}

export async function requestPasswordResetRequest(email: string) {
  await apiClient.post('/auth/password/reset/', { email })
}

export async function confirmPasswordResetRequest(payload: { uid: string; token: string; new_password: string }) {
  await apiClient.post('/auth/password/reset/confirm/', payload)
}

export async function changePasswordRequest(payload: { current_password: string; new_password: string }) {
  await apiClient.post('/auth/password/change/', payload)
}
