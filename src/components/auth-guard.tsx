'use client'

import { useEffect, ReactNode } from 'react'
import { useStore } from '@/lib/store'
import { ViewType } from '@/lib/store'

interface AuthGuardProps {
  children: ReactNode
  /** Views that require authentication. If the user is not authenticated and tries to access these views, they'll be redirected to login. */
  protectedViews?: ViewType[]
  /** Views that should redirect away if user is already authenticated. If the user is authenticated and tries to access these views, they'll be redirected. */
  guestOnlyViews?: ViewType[]
  /** Where to redirect authenticated users trying to access guest-only views */
  authenticatedRedirect?: ViewType
}

export function AuthGuard({
  children,
  protectedViews = ['checkout', 'admin'],
  guestOnlyViews = ['login', 'signup'],
  authenticatedRedirect = 'home',
}: AuthGuardProps) {
  const { view, user, setView } = useStore()

  useEffect(() => {
    // If user is not authenticated and trying to access a protected view
    if (!user && protectedViews.includes(view)) {
      setView('login')
    }

    // If user is authenticated and trying to access a guest-only view
    if (user && guestOnlyViews.includes(view)) {
      if (user.role === 'admin') {
        setView('admin')
      } else {
        setView(authenticatedRedirect)
      }
    }
  }, [view, user, setView, protectedViews, guestOnlyViews, authenticatedRedirect])

  return <>{children}</>
}
