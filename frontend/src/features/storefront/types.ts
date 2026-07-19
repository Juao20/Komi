export interface PublicStoreTheme {
  accent_color: string
  font_family: string
  show_hero_banner: boolean
  show_social_links: boolean
}

export interface PublicStore {
  name: string
  slug: string
  description: string
  logo_url: string
  banner_url: string
  primary_color: string
  currency: string
  phone_number: string
  email: string
  address: string
  city: string
  social_facebook: string
  social_instagram: string
  social_tiktok: string
  social_whatsapp: string
  theme: PublicStoreTheme
}

export interface PublicCategory {
  public_id: string
  name: string
  slug: string
  image_url: string
  product_count: number
}

export interface PublicProductListItem {
  public_id: string
  name: string
  slug: string
  price: string
  compare_at_price: string | null
  is_on_sale: boolean
  is_out_of_stock: boolean
  is_low_stock: boolean
  primary_image_url: string
  category_name: string | null
}

export interface PublicProductImage {
  public_id: string
  image_url: string
  alt_text: string
  is_primary: boolean
}

export interface PublicProductVariant {
  public_id: string
  name: string
  effective_price: string
  stock: number
}

export interface PublicProductDetail {
  public_id: string
  name: string
  slug: string
  description: string
  category: { public_id: string; name: string } | null
  price: string
  compare_at_price: string | null
  total_stock: number
  is_out_of_stock: boolean
  is_low_stock: boolean
  is_on_sale: boolean
  has_variants: boolean
  images: PublicProductImage[]
  variants: PublicProductVariant[]
  seo_title: string
  seo_description: string
}
