export interface OrderItem {
  public_id: string
  product_id: string | null
  product_name: string
  variant_name: string
  unit_price: string
  quantity: number
  line_total: number
}

export interface OrderStatusHistoryEntry {
  from_status: string
  to_status: string
  note: string
  created_at: string
}

export interface OrderComment {
  id: number
  author_name: string | null
  message: string
  created_at: string
}

export interface OrderListItem {
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

export interface OrderDetail extends OrderListItem {
  subtotal_amount: string
  discount_amount: string
  shipping_amount: string
  shipping_address: string
  shipping_city: string
  shipping_country: string
  customer_note: string
  cancelled_reason: string
  items: OrderItem[]
  status_history: OrderStatusHistoryEntry[]
  comments: OrderComment[]
  updated_at: string
}
