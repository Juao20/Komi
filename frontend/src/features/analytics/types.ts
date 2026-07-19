export interface DashboardStats {
  revenue: string
  revenue_growth_pct: number
  orders_count: number
  orders_growth_pct: number
  customers_count: number
  products_count: number
  average_order_value: string
  pending_orders_count: number
}

export interface SalesPoint {
  day: string
  orders_count: number
  revenue: string
}

export interface TopProduct {
  product_id: number | null
  product_name: string
  units_sold: number
  revenue: string
}

export interface OrderSummary {
  public_id: string
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  customer_name: string
  customer_phone: string
  total_amount: string
  currency: string
  created_at: string
}

export interface CustomerSummary {
  public_id: string
  full_name: string
  phone_number: string
  email: string
  order_count: number
  total_spent: string
  created_at: string
}

export interface DashboardOverview {
  stats: DashboardStats
  sales_over_time: SalesPoint[]
  top_products: TopProduct[]
  order_status_breakdown: Record<string, number>
  recent_orders: OrderSummary[]
  best_customers: CustomerSummary[]
}
