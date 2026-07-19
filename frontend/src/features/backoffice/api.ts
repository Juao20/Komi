import type {
  AdminEmailLog,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminProductReport,
  AdminStore,
  AdminUser,
  AnalyticsData,
  ComyUsageStats,
  DashboardKPIs,
  EmailStats,
  PlatformSettings,
  SubscriptionsData,
  SystemLogEntry,
} from '@/features/backoffice/types'
import { apiClient } from '@/shared/services/api-client'
import type { Paginated } from '@/shared/types/api'

export async function fetchDashboard() {
  const { data } = await apiClient.get<DashboardKPIs>('/backoffice/dashboard/')
  return data
}

export async function fetchAnalytics(days = 30) {
  const { data } = await apiClient.get<AnalyticsData>('/backoffice/analytics/', { params: { days } })
  return data
}

export interface StoreListParams {
  search?: string
  status?: string
  plan?: string
  page?: number
}
export async function fetchStores(params: StoreListParams) {
  const { data } = await apiClient.get<Paginated<AdminStore>>('/backoffice/stores/', { params })
  return data
}
export async function suspendStore(publicId: string) {
  const { data } = await apiClient.post<AdminStore>(`/backoffice/stores/${publicId}/suspend/`)
  return data
}
export async function activateStore(publicId: string) {
  const { data } = await apiClient.post<AdminStore>(`/backoffice/stores/${publicId}/activate/`)
  return data
}

export interface UserListParams {
  search?: string
  is_active?: string
  page?: number
}
export async function fetchUsers(params: UserListParams) {
  const { data } = await apiClient.get<Paginated<AdminUser>>('/backoffice/users/', { params })
  return data
}
export async function suspendUser(publicId: string) {
  const { data } = await apiClient.post<AdminUser>(`/backoffice/users/${publicId}/suspend/`)
  return data
}
export async function activateUser(publicId: string) {
  const { data } = await apiClient.post<AdminUser>(`/backoffice/users/${publicId}/activate/`)
  return data
}

export interface OrderListParams {
  search?: string
  status?: string
  payment_status?: string
  page?: number
}
export async function fetchOrders(params: OrderListParams) {
  const { data } = await apiClient.get<Paginated<AdminOrder>>('/backoffice/orders/', { params })
  return data
}

export interface PaymentListParams {
  search?: string
  status?: string
  provider?: string
  page?: number
}
export async function fetchPayments(params: PaymentListParams) {
  const { data } = await apiClient.get<Paginated<AdminPayment>>('/backoffice/payments/', { params })
  return data
}

export interface AdminProductListParams {
  search?: string
  status?: string
  page?: number
}
export async function fetchAdminProducts(params: AdminProductListParams) {
  const { data } = await apiClient.get<Paginated<AdminProduct>>('/backoffice/products/', { params })
  return data
}

export async function fetchSubscriptions() {
  const { data } = await apiClient.get<SubscriptionsData>('/backoffice/subscriptions/')
  return data
}

export async function fetchComyUsage(days = 30) {
  const { data } = await apiClient.get<ComyUsageStats>('/backoffice/comy/', { params: { days } })
  return data
}

export interface ReportListParams {
  status?: string
  page?: number
}
export async function fetchReports(params: ReportListParams) {
  const { data } = await apiClient.get<Paginated<AdminProductReport>>('/backoffice/reports/', { params })
  return data
}
export async function resolveReport(publicId: string) {
  const { data } = await apiClient.post<AdminProductReport>(`/backoffice/reports/${publicId}/resolve/`)
  return data
}
export async function dismissReport(publicId: string) {
  const { data } = await apiClient.post<AdminProductReport>(`/backoffice/reports/${publicId}/dismiss/`)
  return data
}

export interface LogListParams {
  level?: string
  page?: number
}
export async function fetchSystemLogs(params: LogListParams) {
  const { data } = await apiClient.get<Paginated<SystemLogEntry>>('/backoffice/logs/', { params })
  return data
}

export interface EmailLogListParams {
  status?: string
  page?: number
}
export async function fetchEmailLogs(params: EmailLogListParams) {
  const { data } = await apiClient.get<Paginated<AdminEmailLog>>('/backoffice/emails/', { params })
  return data
}
export async function fetchEmailStats() {
  const { data } = await apiClient.get<EmailStats>('/backoffice/emails/stats/')
  return data
}

export async function fetchPlatformSettings() {
  const { data } = await apiClient.get<PlatformSettings>('/backoffice/settings/')
  return data
}

export async function downloadCsvExport(
  path: string,
  params: Record<string, string | number | undefined>,
  filename: string,
) {
  const response = await apiClient.get(path, { params: { ...params, export: 'csv' }, responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
