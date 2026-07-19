import { Minus, Package, Plus, ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useCartStore } from '@/features/storefront/cart-store'
import { ReportProductDialog } from '@/features/storefront/components/ReportProductDialog'
import { usePublicProduct } from '@/features/storefront/hooks'
import type { PublicStore } from '@/features/storefront/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getContrastColor } from '@/shared/utils/color'
import { formatMoney } from '@/shared/utils/format'

export function StorefrontProductPage() {
  const store = useOutletContext<PublicStore>()
  const { productSlug } = useParams<{ productSlug: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)

  const { data: product, isPending } = usePublicProduct(store.slug, productSlug)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.public_id === selectedVariantId) ?? null,
    [product, selectedVariantId],
  )

  if (isPending || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const unitPrice = Number(selectedVariant ? selectedVariant.effective_price : product.price)
  const availableStock = product.has_variants ? (selectedVariant?.stock ?? 0) : product.total_stock
  const canAddToCart = !product.has_variants || Boolean(selectedVariant)
  const outOfStock = product.has_variants ? Boolean(selectedVariant) && availableStock <= 0 : product.is_out_of_stock

  const contrast = getContrastColor(store.primary_color)
  const images = product.images.length > 0 ? product.images : [{ image_url: '', public_id: 'placeholder', alt_text: '', is_primary: true }]

  const handleAddToCart = () => {
    if (product.has_variants && !selectedVariant) {
      toast.error('Choisissez une option avant d\'ajouter au panier.')
      return
    }
    addItem(store.slug, {
      productId: product.public_id,
      variantId: selectedVariant?.public_id,
      name: product.name,
      variantName: selectedVariant?.name,
      unitPrice,
      image: product.images[0]?.image_url ?? '',
      quantity,
      maxStock: availableStock,
    })
    toast.success('Ajouté au panier.')
    navigate(`/s/${store.slug}/panier`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
            {images[activeImage]?.image_url ? (
              <img src={images[activeImage].image_url} alt={product.name} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Package className="size-10" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image.public_id}
                  onClick={() => setActiveImage(index)}
                  className={`size-16 overflow-hidden rounded-lg border-2 ${index === activeImage ? 'border-foreground' : 'border-transparent'}`}
                >
                  <img src={image.image_url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && <p className="text-sm text-muted-foreground">{product.category.name}</p>}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-xl font-semibold">{formatMoney(unitPrice, store.currency)}</span>
            {product.is_on_sale && product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">{formatMoney(product.compare_at_price, store.currency)}</span>
            )}
            {outOfStock && <Badge variant="destructive">Rupture de stock</Badge>}
            {!outOfStock && product.is_low_stock && <Badge variant="warning">Stock limité</Badge>}
          </div>

          {product.description && <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>}

          {product.has_variants && (
            <div className="mt-6">
              <p className="text-sm font-medium">Choisissez une option</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.public_id}
                    disabled={variant.stock <= 0}
                    onClick={() => setSelectedVariantId(variant.public_id)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selectedVariantId === variant.public_id ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(availableStock || 99, q + 1))}
                className="flex size-10 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={!canAddToCart || outOfStock}
              style={{ backgroundColor: store.primary_color, color: contrast }}
              onClick={handleAddToCart}
            >
              <ShoppingBag />
              {outOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
            </Button>
          </div>

          <div className="mt-4">
            <ReportProductDialog storeSlug={store.slug} productSlug={product.slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
