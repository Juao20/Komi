export interface Category {
  public_id: string
  name: string
  slug: string
  description: string
  image_url: string
  position: number
  product_count?: number
}

export interface ProductImage {
  public_id: string
  image_url: string
  alt_text: string
  is_primary: boolean
  position: number
}

export interface ProductVariant {
  public_id: string
  name: string
  sku: string
  price: string | null
  effective_price: string
  stock: number
  position: number
}

export type ProductStatus = 'draft' | 'active' | 'archived'

export interface ProductListItem {
  public_id: string
  name: string
  slug: string
  price: string
  compare_at_price: string | null
  status: ProductStatus
  total_stock: number
  is_low_stock: boolean
  is_out_of_stock: boolean
  primary_image_url: string
  category_name: string | null
  created_at: string
}

export interface ProductDetail {
  public_id: string
  name: string
  slug: string
  description: string
  category: { public_id: string; name: string } | null
  price: string
  compare_at_price: string | null
  sku: string
  stock: number
  track_inventory: boolean
  low_stock_threshold: number
  weight_kg: string | null
  status: ProductStatus
  seo_title: string
  seo_description: string
  total_stock: number
  is_low_stock: boolean
  is_out_of_stock: boolean
  is_on_sale: boolean
  has_variants: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface ProductWritePayload {
  name: string
  slug?: string
  description?: string
  category?: string | null
  price: number
  compare_at_price?: number | null
  sku?: string
  stock?: number
  track_inventory?: boolean
  low_stock_threshold?: number
  status?: ProductStatus
  images?: { image_url: string; alt_text?: string; is_primary?: boolean }[]
  variants?: { name: string; sku?: string; price?: number | null; stock?: number }[]
}
