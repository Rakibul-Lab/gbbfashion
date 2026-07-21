'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useStore, type ViewType } from '@/lib/store'

const DEFAULT_PROTECTED: ViewType[] = ['admin', 'account']
const DEFAULT_GUEST_ONLY: ViewType[] = ['login', 'signup']

interface AuthGuardProps {
  children: ReactNode
  protectedViews?: ViewType[]
  guestOnlyViews?: ViewType[]
}

function isAdminPath(pathname: string | null) {
  return pathname === '/admin' || Boolean(pathname?.startsWith('/admin/'))
}

/** Keeps Zustand user in sync with NextAuth session (survives refresh). */
function useHydrateUserFromSession() {
  const { data: session, status } = useSession()
  const setUser = useStore((s) => s.setUser)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'customer',
      })
      return
    }

    if (status === 'unauthenticated') {
      setUser(null)
    }
  }, [session, status, setUser])
}

export function AuthGuard({
  children,
  protectedViews = DEFAULT_PROTECTED,
  guestOnlyViews = DEFAULT_GUEST_ONLY,
}: AuthGuardProps) {
  const { status } = useSession()
  const pathname = usePathname()
  const view = useStore((s) => s.view)
  const user = useStore((s) => s.user)
  const setView = useStore((s) => s.setView)
  const setPostLoginView = useStore((s) => s.setPostLoginView)
  const consumePostLoginView = useStore((s) => s.consumePostLoginView)
  useHydrateUserFromSession()
  const sawLoading = useRef(false)

  useEffect(() => {
    if (status === 'loading') {
      sawLoading.current = true
      return
    }

    const onAdmin = isAdminPath(pathname)

    // Locked: authenticated admin on /admin — never leave this URL/view
    if (status === 'authenticated' && user?.role === 'admin' && onAdmin) {
      if (view !== 'admin') {
        setView('admin', { replace: true, syncUrl: false })
      }
      return
    }

    // Authenticated admin should land on admin after login screens
    if (status === 'authenticated' && user?.role === 'admin' && guestOnlyViews.includes(view)) {
      consumePostLoginView()
      setView('admin', { replace: true })
      return
    }

    // Only redirect away from protected views after a real unauthenticated state
    if (status === 'unauthenticated' && sawLoading.current) {
      if (protectedViews.includes(view) || onAdmin) {
        setPostLoginView(onAdmin ? 'admin' : view)
        // Always leave /admin for the storefront login page
        setView('login', { replace: true })
        return
      }
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
    pathname,
    setView,
    setPostLoginView,
    consumePostLoginView,
    protectedViews,
    guestOnlyViews,
  ])

  return <>{children}</>
}
