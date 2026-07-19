export interface StoreTheme {
  accent_color: string
  font_family: 'inter' | 'poppins' | 'manrope' | 'sora' | 'work_sans'
  show_hero_banner: boolean
  show_social_links: boolean
  updated_at: string
}

export interface Store {
  public_id: string
  name: string
  slug: string
  description: string
  sector: string
  country: string
  currency: string
  phone_number: string
  email: string
  address: string
  city: string
  logo_url: string
  banner_url: string
  primary_color: string
  social_facebook: string
  social_instagram: string
  social_tiktok: string
  social_whatsapp: string
  status: 'draft' | 'published' | 'suspended'
  plan: 'free' | 'starter' | 'pro'
  public_url: string
  is_published: boolean
  product_limit: number | null
  theme: StoreTheme
  created_at: string
}

export interface CreateStorePayload {
  name: string
  sector: string
  country: string
  currency: string
  phone_number?: string
  description?: string
  primary_color?: string
  slug?: string
}

export const SECTORS: { value: string; label: string }[] = [
  { value: 'clothing', label: 'Vêtements' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'cosmetics', label: 'Cosmétiques' },
  { value: 'perfumes', label: 'Parfums' },
  { value: 'phones', label: 'Téléphones' },
  { value: 'accessories', label: 'Accessoires' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'pastry', label: 'Pâtisserie' },
  { value: 'electronics', label: 'Électronique' },
  { value: 'beauty', label: 'Beauté' },
  { value: 'services', label: 'Services' },
  { value: 'crafts', label: 'Artisanat' },
  { value: 'other', label: 'Autre' },
]

export const COUNTRIES: { value: string; label: string }[] = [
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'SN', label: 'Sénégal' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'BJ', label: 'Bénin' },
  { value: 'TG', label: 'Togo' },
  { value: 'ML', label: 'Mali' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'CD', label: 'RD Congo' },
  { value: 'CG', label: 'Congo' },
  { value: 'GA', label: 'Gabon' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'Afrique du Sud' },
  { value: 'MA', label: 'Maroc' },
  { value: 'EG', label: 'Égypte' },
  { value: 'OTHER', label: 'Autre' },
]

export const CURRENCIES: { value: string; label: string }[] = [
  { value: 'XOF', label: 'Franc CFA (XOF)' },
  { value: 'XAF', label: 'Franc CFA (XAF)' },
  { value: 'NGN', label: 'Naira (NGN)' },
  { value: 'GHS', label: 'Cedi (GHS)' },
  { value: 'KES', label: 'Shilling (KES)' },
  { value: 'ZAR', label: 'Rand (ZAR)' },
  { value: 'MAD', label: 'Dirham (MAD)' },
  { value: 'EGP', label: 'Livre égyptienne (EGP)' },
  { value: 'USD', label: 'Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
]
