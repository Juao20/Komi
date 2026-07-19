import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useMe } from '@/features/auth/hooks'
import { FullPageLoader } from '@/shared/components/FullPageLoader'

export function RequireStaff({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useMe()

  if (isPending) {
    return <FullPageLoader />
  }

  if (!user?.is_staff) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
