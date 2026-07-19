import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as authApi from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorMessage } from '@/shared/services/api-client'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useMe() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.fetchMe,
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  })
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)
  return useMutation({
    mutationFn: authApi.loginRequest,
    onSuccess: (data) => {
      setSession({ access: data.access, refresh: data.refresh }, data.user)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Email ou mot de passe incorrect.'))
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.registerRequest,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Impossible de créer le compte."))
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authApi.logoutRequest(refreshToken).catch(() => undefined)
      }
    },
    onSuccess: () => {
      clearSession()
      queryClient.clear()
    },
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      setUser(user)
      toast.success('Profil mis à jour.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useVerifyEmail() {
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation({
    mutationFn: authApi.verifyEmailRequest,
    onSuccess: (user) => setUser(user),
  })
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: authApi.resendVerificationEmailRequest,
    onSuccess: () => toast.success('Email de vérification envoyé.'),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: authApi.requestPasswordResetRequest,
  })
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: authApi.confirmPasswordResetRequest,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePasswordRequest,
    onSuccess: () => toast.success('Mot de passe mis à jour.'),
    onError: (error) => toast.error(getApiErrorMessage(error, 'Mot de passe actuel incorrect.')),
  })
}
