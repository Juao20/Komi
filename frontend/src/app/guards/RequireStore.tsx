import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useMe } from '@/features/auth/hooks'
import { FullPageLoader } from '@/shared/components/FullPageLoader'

export function RequireStore({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useMe()

  if (isPending) {
    return <FullPageLoader />
  }

  if (user && !user.has_store) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export function RequireNoStore({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useMe()

  if (isPending) {
    return <FullPageLoader />
  }

  if (user?.has_store) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
