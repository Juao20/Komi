import {
  BarChart3,
  Bell,
  CreditCard,
  FileWarning,
  LayoutDashboard,
  Package,
  ScrollText,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from 'lucide-react'

import { ComyIcon } from '@/shared/components/ComyIcon'

export const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/stores', label: 'Boutiques', icon: Store },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/payments', label: 'Paiements', icon: CreditCard },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/subscriptions', label: 'Abonnements', icon: Wallet },
  { to: '/admin/comy', label: 'Comy', icon: ComyIcon },
  { to: '/admin/reports', label: 'Signalements', icon: FileWarning },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings },
]
