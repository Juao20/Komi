export interface DashboardKPIs {
  total_stores: number
  published_stores: number
  new_stores_this_week: number
  total_users: number
  new_users_this_week: number
  total_orders: number
  orders_today: number
  gmv_total: string | number
  gmv_this_month: string | number
  revenue_today: string | number
  aov: string | number
  mrr: number
  arr: number
  pending_withdrawals: number
}

export interface AnalyticsData {
  date_from: string
  date_to: string
  orders_series: { day: string; orders: number; gmv: string | number | null }[]
  signups_series: { day: string; signups: number }[]
  dau: number
  wau: number
  mau: number
  conversion_rate: number
  retention_rate: number
}

export type StoreStatus = 'draft' | 'published' | 'suspended'
export type StorePlan = 'free' | 'starter' | 'pro'

export interface AdminStore {
  public_id: string
  name: string
  slug: string
  sector: string
  country: string
  currency: string
  status: StoreStatus
  plan: StorePlan
  owner_email: string
  owner_name: string
  orders_count: number
  products_count: number
  published_at: string | null
  created_at: string
}

export interface AdminUser {
  public_id: string
  email: string
  full_name: string
  phone_number: string
  is_active: boolean
  is_staff: boolean
  is_email_verified: boolean
  has_store: boolean
  store_name: string | null
  last_login: string | null
  created_at: string
}

export interface AdminOrder {
  public_id: string
  order_number: string
  store_name: string
  status: string
  payment_method: string
  payment_status: string
  currency: string
  total_amount: string
  customer_name: string
  created_at: string
}

export interface AdminPayment {
  public_id: string
  payment_reference: string
  store_name: string
  order_number: string | null
  provider: string
  payment_method: string
  amount: string
  currency: string
  status: string
  paid_at: string | null
  created_at: string
}

export interface AdminProduct {
  public_id: string
  name: string
  store_name: string
  price: string
  stock: number
  status: string
  is_deleted: boolean
  created_at: string
}

export interface SubscriptionBreakdownRow {
  plan: StorePlan
  count: number
  price: number
  mrr: number
}

export interface SubscriptionsData {
  breakdown: SubscriptionBreakdownRow[]
  mrr: number
}

export interface ComyUsageStats {
  date_from: string
  date_to: string
  total_calls: number
  cache_hit_rate: number
  total_tokens: number
  avg_duration_ms: number
  failed_calls: number
  estimated_cost_usd: number
  by_feature: { feature: string; calls: number; tokens: number }[]
  daily_series: { day: string; calls: number; tokens: number }[]
}

export type ProductReportStatus = 'pending' | 'reviewed' | 'dismissed'

export interface AdminProductReport {
  public_id: string
  product_name: string
  store_name: string
  reason: string
  message: string
  reporter_email: string
  status: ProductReportStatus
  created_at: string
}

export interface SystemLogEntry {
  id: number
  level: string
  logger_name: string
  message: string
  created_at: string
}

export type EmailLogStatus = 'queued' | 'sent' | 'failed'

export interface AdminEmailLog {
  public_id: string
  recipient: string
  subject: string
  template_name: string
  status: EmailLogStatus
  provider: string
  error_message: string
  created_at: string
}

export interface EmailStats {
  total: number
  sent: number
  failed: number
  queued: number
}

export interface PlatformSettings {
  ai_provider: string
  email_provider: string
  payment_provider: string
  fedapay_environment: string
  store_domain_suffix: string
  plan_prices: Record<string, number>
}
