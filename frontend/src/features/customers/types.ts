export interface Address {
  public_id: string
  label: string
  full_address: string
  city: string
  country: string
  is_default: boolean
}

export interface CustomerListItem {
  public_id: string
  full_name: string
  phone_number: string
  email: string
  order_count: number
  total_spent: string
  created_at: string
}

export interface CustomerDetail extends CustomerListItem {
  notes: string
  addresses: Address[]
}
