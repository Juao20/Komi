import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as backofficeApi from '@/features/backoffice/api'
import { useAuthStore } from '@/features/auth/store'
import { getApiErrorMessage } from '@/shared/services/api-client'

export const backofficeKeys = {
  dashboard: ['backoffice', 'dashboard'] as const,
  analytics: (days: number) => ['backoffice', 'analytics', days] as const,
  stores: (params: backofficeApi.StoreListParams) => ['backoffice', 'stores', params] as const,
  users: (params: backofficeApi.UserListParams) => ['backoffice', 'users', params] as const,
  orders: (params: backofficeApi.OrderListParams) => ['backoffice', 'orders', params] as const,
  payments: (params: backofficeApi.PaymentListParams) => ['backoffice', 'payments', params] as const,
  products: (params: backofficeApi.AdminProductListParams) => ['backoffice', 'products', params] as const,
  subscriptions: ['backoffice', 'subscriptions'] as const,
  comy: (days: number) => ['backoffice', 'comy', days] as const,
  reports: (params: backofficeApi.ReportListParams) => ['backoffice', 'reports', params] as const,
  logs: (params: backofficeApi.LogListParams) => ['backoffice', 'logs', params] as const,
  emails: (params: backofficeApi.EmailLogListParams) => ['backoffice', 'emails', params] as const,
  emailStats: ['backoffice', 'emails', 'stats'] as const,
  settings: ['backoffice', 'settings'] as const,
}

function useStaffEnabled() {
  const accessToken = useAuthStore((state) => state.accessToken)
  return Boolean(accessToken)
}

export function useAdminDashboard() {
  const enabled = useStaffEnabled()
  return useQuery({ queryKey: backofficeKeys.dashboard, queryFn: backofficeApi.fetchDashboard, enabled })
}

export function useAdminAnalytics(days = 30) {
  const enabled = useStaffEnabled()
  return useQuery({ queryKey: backofficeKeys.analytics(days), queryFn: () => backofficeApi.fetchAnalytics(days), enabled })
}

export function useAdminStores(params: backofficeApi.StoreListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.stores(params),
    queryFn: () => backofficeApi.fetchStores(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useSuspendStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: backofficeApi.suspendStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice', 'stores'] })
      toast.success('Boutique suspendue.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useActivateStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: backofficeApi.activateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice', 'stores'] })
      toast.success('Boutique réactivée.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useAdminUsers(params: backofficeApi.UserListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.users(params),
    queryFn: () => backofficeApi.fetchUsers(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: backofficeApi.suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice', 'users'] })
      toast.success('Utilisateur suspendu.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: backofficeApi.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice', 'users'] })
      toast.success('Utilisateur réactivé.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useAdminOrders(params: backofficeApi.OrderListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.orders(params),
    queryFn: () => backofficeApi.fetchOrders(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useAdminPayments(params: backofficeApi.PaymentListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.payments(params),
    queryFn: () => backofficeApi.fetchPayments(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useAdminProducts(params: backofficeApi.AdminProductListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.products(params),
    queryFn: () => backofficeApi.fetchAdminProducts(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useAdminSubscriptions() {
  const enabled = useStaffEnabled()
  return useQuery({ queryKey: backofficeKeys.subscriptions, queryFn: backofficeApi.fetchSubscriptions, enabled })
}

export function useAdminComyUsage(days = 30) {
  const enabled = useStaffEnabled()
  return useQuery({ queryKey: backofficeKeys.comy(days), queryFn: () => backofficeApi.fetchComyUsage(days), enabled })
}

export function useAdminReports(params: backofficeApi.ReportListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.reports(params),
    queryFn: () => backofficeApi.fetchReports(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useResolveReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: backofficeApi.resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice', 'reports'] })
      toast.success('Signalement marqué comme examiné.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useDismissReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: backofficeApi.dismissReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backoffice', 'reports'] })
      toast.success('Signalement rejeté.')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export function useAdminSystemLogs(params: backofficeApi.LogListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.logs(params),
    queryFn: () => backofficeApi.fetchSystemLogs(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useAdminEmailLogs(params: backofficeApi.EmailLogListParams) {
  const enabled = useStaffEnabled()
  return useQuery({
    queryKey: backofficeKeys.emails(params),
    queryFn: () => backofficeApi.fetchEmailLogs(params),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useAdminEmailStats() {
  const enabled = useStaffEnabled()
  return useQuery({ queryKey: backofficeKeys.emailStats, queryFn: backofficeApi.fetchEmailStats, enabled })
}

export function useAdminPlatformSettings() {
  const enabled = useStaffEnabled()
  return useQuery({ queryKey: backofficeKeys.settings, queryFn: backofficeApi.fetchPlatformSettings, enabled })
}
