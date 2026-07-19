export interface User {
  public_id: string
  email: string
  full_name: string
  phone_number: string
  avatar_url: string
  is_email_verified: boolean
  has_store: boolean
  is_staff: boolean
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}
