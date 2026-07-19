import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth } from '@/app/guards/RequireAuth'
import { RequireGuest } from '@/app/guards/RequireGuest'
import { RequireNoStore, RequireStore } from '@/app/guards/RequireStore'
import { RequireStaff } from '@/app/guards/RequireStaff'
import { FullPageLoader } from '@/shared/components/FullPageLoader'

const LandingPage = lazy(() => import('@/features/landing/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const VerifyEmailPage = lazy(() =>
  import('@/features/auth/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
)
const OnboardingPage = lazy(() => import('@/features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage })))

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ProductsPage = lazy(() => import('@/features/products/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })))
const ProductFormPage = lazy(() =>
  import('@/features/products/pages/ProductFormPage').then((m) => ({ default: m.ProductFormPage })),
)
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const CustomersPage = lazy(() => import('@/features/customers/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const WalletPage = lazy(() => import('@/features/wallet/WalletPage').then((m) => ({ default: m.WalletPage })))
const StoreSettingsPage = lazy(() =>
  import('@/features/store/pages/StoreSettingsPage').then((m) => ({ default: m.StoreSettingsPage })),
)
const PersonalizationPage = lazy(() =>
  import('@/features/store/pages/PersonalizationPage').then((m) => ({ default: m.PersonalizationPage })),
)
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const BillingPage = lazy(() => import('@/features/billing/BillingPage').then((m) => ({ default: m.BillingPage })))
const AIAssistantPage = lazy(() => import('@/features/ai-assistant/AIAssistantPage').then((m) => ({ default: m.AIAssistantPage })))
const NotFoundPage = lazy(() => import('@/shared/components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const AdminDashboardPage = lazy(() =>
  import('@/features/backoffice/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminAnalyticsPage = lazy(() =>
  import('@/features/backoffice/pages/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })),
)
const AdminStoresPage = lazy(() =>
  import('@/features/backoffice/pages/AdminStoresPage').then((m) => ({ default: m.AdminStoresPage })),
)
const AdminUsersPage = lazy(() =>
  import('@/features/backoffice/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
const AdminOrdersPage = lazy(() =>
  import('@/features/backoffice/pages/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
)
const AdminPaymentsPage = lazy(() =>
  import('@/features/backoffice/pages/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })),
)
const AdminProductsPage = lazy(() =>
  import('@/features/backoffice/pages/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
)
const AdminSubscriptionsPage = lazy(() =>
  import('@/features/backoffice/pages/AdminSubscriptionsPage').then((m) => ({ default: m.AdminSubscriptionsPage })),
)
const AdminComyPage = lazy(() => import('@/features/backoffice/pages/AdminComyPage').then((m) => ({ default: m.AdminComyPage })))
const AdminReportsPage = lazy(() =>
  import('@/features/backoffice/pages/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })),
)
const AdminLogsPage = lazy(() => import('@/features/backoffice/pages/AdminLogsPage').then((m) => ({ default: m.AdminLogsPage })))
const AdminNotificationsPage = lazy(() =>
  import('@/features/backoffice/pages/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage })),
)
const AdminSettingsPage = lazy(() =>
  import('@/features/backoffice/pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
)

const StorefrontHomePage = lazy(() =>
  import('@/features/storefront/pages/StorefrontHomePage').then((m) => ({ default: m.StorefrontHomePage })),
)
const StorefrontProductPage = lazy(() =>
  import('@/features/storefront/pages/StorefrontProductPage').then((m) => ({ default: m.StorefrontProductPage })),
)
const StorefrontCartPage = lazy(() =>
  import('@/features/storefront/pages/StorefrontCartPage').then((m) => ({ default: m.StorefrontCartPage })),
)
const StorefrontCheckoutPage = lazy(() =>
  import('@/features/storefront/pages/StorefrontCheckoutPage').then((m) => ({ default: m.StorefrontCheckoutPage })),
)
const StorefrontOrderConfirmationPage = lazy(() =>
  import('@/features/storefront/pages/StorefrontOrderConfirmationPage').then((m) => ({
    default: m.StorefrontOrderConfirmationPage,
  })),
)
const StorefrontPaymentReturnPage = lazy(() =>
  import('@/features/storefront/pages/StorefrontPaymentReturnPage').then((m) => ({
    default: m.StorefrontPaymentReturnPage,
  })),
)

const AuthLayout = lazy(() => import('@/layouts/AuthLayout').then((m) => ({ default: m.AuthLayout })))
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout').then((m) => ({ default: m.DashboardLayout })))
const StorefrontLayout = lazy(() => import('@/layouts/StorefrontLayout').then((m) => ({ default: m.StorefrontLayout })))
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })))

export function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          element={
            <RequireGuest>
              <AuthLayout />
            </RequireGuest>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          path="/verify-email"
          element={
            <RequireAuth>
              <AuthLayout />
            </RequireAuth>
          }
        >
          <Route index element={<VerifyEmailPage />} />
        </Route>

        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <RequireNoStore>
                <OnboardingPage />
              </RequireNoStore>
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireStore>
                <DashboardLayout />
              </RequireStore>
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:productId/edit" element={<ProductFormPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="store" element={<StoreSettingsPage />} />
          <Route path="personalization" element={<PersonalizationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireStaff>
                <AdminLayout />
              </RequireStaff>
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="stores" element={<AdminStoresPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="comy" element={<AdminComyPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="/s/:slug" element={<StorefrontLayout />}>
          <Route index element={<StorefrontHomePage />} />
          <Route path="produits/:productSlug" element={<StorefrontProductPage />} />
          <Route path="panier" element={<StorefrontCartPage />} />
          <Route path="commande" element={<StorefrontCheckoutPage />} />
          <Route path="commande/confirmation" element={<StorefrontOrderConfirmationPage />} />
          <Route path="commande/:orderPublicId/retour" element={<StorefrontPaymentReturnPage />} />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
