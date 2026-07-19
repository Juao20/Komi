import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { PublicProductListItem } from '@/features/storefront/types'
import { Badge } from '@/shared/components/ui/badge'
import { formatMoney } from '@/shared/utils/format'

export function ProductCard({ product, storeSlug, currency }: { product: PublicProductListItem; storeSlug: string; currency: string }) {
  return (
    <Link
      to={`/s/${storeSlug}/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-elevation-medium"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.primary_image_url ? (
          <img
            src={product.primary_image_url}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Package className="size-8" />
          </div>
        )}
        {product.is_out_of_stock && (
          <Badge variant="secondary" className="absolute left-2 top-2 bg-background/90">
            Rupture de stock
          </Badge>
        )}
        {!product.is_out_of_stock && product.is_on_sale && (
          <Badge variant="destructive" className="absolute left-2 top-2">
            Promo
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category_name && <p className="text-xs text-muted-foreground">{product.category_name}</p>}
        <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-sm font-semibold">{formatMoney(product.price, currency)}</span>
          {product.is_on_sale && product.compare_at_price && (
            <span className="text-xs text-muted-foreground line-through">{formatMoney(product.compare_at_price, currency)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
