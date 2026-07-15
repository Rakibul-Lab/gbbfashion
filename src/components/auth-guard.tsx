'use client'

import { useEffect, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useStore, type ViewType } from '@/lib/store'

interface AuthGuardProps {
  children: ReactNode
  protectedViews?: ViewType[]
  guestOnlyViews?: ViewType[]
}

/** Keeps Zustand user in sync with NextAuth session (survives refresh). */
function useHydrateUserFromSession() {
  const { data: session, status } = useSession()
  const setUser = useStore((s) => s.setUser)
  const user = useStore((s) => s.user)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user) {
      const next = {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'customer',
      }
      if (
        !user ||
        user.id !== next.id ||
        user.name !== next.name ||
        user.email !== next.email ||
        user.role !== next.role
      ) {
        setUser(next)
      }
      return
    }

    if (status === 'unauthenticated' && user) {
      setUser(null)
    }
  }, [session, status, setUser, user])
}

export function AuthGuard({
  children,
  protectedViews = ['admin', 'account'],
  guestOnlyViews = ['login', 'signup'],
}: AuthGuardProps) {
  const { status } = useSession()
  const { view, user, setView, setPostLoginView, consumePostLoginView } = useStore()
  useHydrateUserFromSession()

  useEffect(() => {
    // Wait for NextAuth before enforcing redirects (avoids bounce to home/login on refresh)
    if (status === 'loading') return

    if (status === 'unauthenticated' && protectedViews.includes(view)) {
      setPostLoginView(view)
      setView('login', { replace: true })
      return
    }

    if (status === 'authenticated' && user && guestOnlyViews.includes(view)) {
      const pending = consumePostLoginView()
      if (user.role === 'admin') {
        setView('admin', { replace: true })
      } else if (pending && pending !== 'login' && pending !== 'signup') {
        setView(pending, { replace: true })
      } else {
        setView('account', { replace: true })
      }
    }
  }, [
    status,
    view,
    user,
    setView,
    setPostLoginView,
    consumePostLoginView,
    protectedViews,
    guestOnlyViews,
  ])

  return <>{children}</>
}
