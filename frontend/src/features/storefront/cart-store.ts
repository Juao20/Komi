import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  variantName?: string
  unitPrice: number
  image: string
  quantity: number
  maxStock: number
}

interface CartState {
  carts: Record<string, CartItem[]>
  addItem: (storeSlug: string, item: CartItem) => void
  updateQuantity: (storeSlug: string, productId: string, variantId: string | undefined, quantity: number) => void
  removeItem: (storeSlug: string, productId: string, variantId?: string) => void
  clearCart: (storeSlug: string) => void
}

const itemKey = (productId: string, variantId?: string) => `${productId}::${variantId ?? ''}`

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      carts: {},
      addItem: (storeSlug, item) =>
        set((state) => {
          const cart = state.carts[storeSlug] ?? []
          const key = itemKey(item.productId, item.variantId)
          const existing = cart.find((entry) => itemKey(entry.productId, entry.variantId) === key)

          const nextCart = existing
            ? cart.map((entry) =>
                itemKey(entry.productId, entry.variantId) === key
                  ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, entry.maxStock) }
                  : entry,
              )
            : [...cart, item]

          return { carts: { ...state.carts, [storeSlug]: nextCart } }
        }),
      updateQuantity: (storeSlug, productId, variantId, quantity) =>
        set((state) => {
          const cart = state.carts[storeSlug] ?? []
          const key = itemKey(productId, variantId)
          const nextCart = cart
            .map((entry) => (itemKey(entry.productId, entry.variantId) === key ? { ...entry, quantity } : entry))
            .filter((entry) => entry.quantity > 0)
          return { carts: { ...state.carts, [storeSlug]: nextCart } }
        }),
      removeItem: (storeSlug, productId, variantId) =>
        set((state) => {
          const key = itemKey(productId, variantId)
          const cart = (state.carts[storeSlug] ?? []).filter((entry) => itemKey(entry.productId, entry.variantId) !== key)
          return { carts: { ...state.carts, [storeSlug]: cart } }
        }),
      clearCart: (storeSlug) => set((state) => ({ carts: { ...state.carts, [storeSlug]: [] } })),
    }),
    { name: 'komi-cart' },
  ),
)

export function useCart(storeSlug: string) {
  return useCartStore((state) => state.carts[storeSlug] ?? [])
}

export function useCartCount(storeSlug: string) {
  return useCartStore((state) => (state.carts[storeSlug] ?? []).reduce((sum, item) => sum + item.quantity, 0))
}

export function useCartTotal(storeSlug: string) {
  return useCartStore((state) =>
    (state.carts[storeSlug] ?? []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  )
}
