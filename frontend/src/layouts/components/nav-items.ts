import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
  Wallet,
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/products', label: 'Produits', icon: Package },
  { to: '/dashboard/orders', label: 'Commandes', icon: ShoppingBag },
  { to: '/dashboard/customers', label: 'Clients', icon: Users },
  { to: '/dashboard/analytics', label: 'Statistiques', icon: BarChart3 },
  { to: '/dashboard/wallet', label: 'Portefeuille', icon: Wallet },
]

export const STORE_NAV_ITEMS = [
  { to: '/dashboard/store', label: 'Boutique', icon: Store },
  { to: '/dashboard/personalization', label: 'Personnalisation', icon: Palette },
]

export const SETTINGS_NAV_ITEMS = [
  { to: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  { to: '/dashboard/billing', label: 'Facturation', icon: CreditCard },
]

export const AI_NAV_ITEM = { to: '/dashboard/ai-assistant', label: 'Comy', icon: Sparkles }
