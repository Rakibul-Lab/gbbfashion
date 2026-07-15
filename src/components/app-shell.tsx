'use client'

import { Suspense, useEffect, useLayoutEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { enableStorePersistWrites, useStore } from '@/lib/store'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppFloat } from '@/components/whatsapp-float'
import { AuthGuard } from '@/components/auth-guard'
import { parseShopSlug } from '@/lib/shop-navigation'
import { parseAppPath } from '@/lib/view-routes'
import { registerAppNavigator } from '@/lib/app-navigate'
import dynamic from 'next/dynamic'

/** Rehydrate persisted cart before any route-driven store writes */
function useStoreHydration() {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== 'undefined' ? useStore.persist.hasHydrated() : false
  )

  useLayoutEffect(() => {
    let cancelled = false

    const finish = () => {
      enableStorePersistWrites()
      if (!cancelled) setHydrated(true)
    }

    if (useStore.persist.hasHydrated()) {
      finish()
      return
    }

    const unsub = useStore.persist.onFinishHydration(finish)
    void useStore.persist.rehydrate()

    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  return hydrated
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
    </div>
  )
}

function SectionLoader() {
  return <div className="h-48" />
}

const HeroSection = dynamic(() => import('@/components/hero-section').then(m => ({ default: m.HeroSection })), { loading: SectionLoader })
const FeaturedCollections = dynamic(() => import('@/components/featured-collections').then(m => ({ default: m.FeaturedCollections })), { loading: SectionLoader })
const PromoBanners = dynamic(() => import('@/components/promo-banners').then(m => ({ default: m.PromoBanners })), { loading: SectionLoader })
const NewInTrend = dynamic(() => import('@/components/new-in-trend').then(m => ({ default: m.NewInTrend })), { loading: SectionLoader })
const StoriesSection = dynamic(() => import('@/components/stories-section').then(m => ({ default: m.StoriesSection })), { loading: SectionLoader })
const BackpackSeries = dynamic(() => import('@/components/backpack-series').then(m => ({ default: m.BackpackSeries })), { loading: SectionLoader })
const BagTheVibe = dynamic(() => import('@/components/bag-the-vibe').then(m => ({ default: m.BagTheVibe })), { loading: SectionLoader })
const LuxeLeatherBags = dynamic(() => import('@/components/luxe-leather-bags').then(m => ({ default: m.LuxeLeatherBags })), { loading: SectionLoader })
const ToteBackpack = dynamic(() => import('@/components/tote-backpack').then(m => ({ default: m.ToteBackpack })), { loading: SectionLoader })
const OwnItLeadIt = dynamic(() => import('@/components/own-it-lead-it').then(m => ({ default: m.OwnItLeadIt })), { loading: SectionLoader })
const TrustBar = dynamic(() => import('@/components/trust-bar').then(m => ({ default: m.TrustBar })), { loading: SectionLoader })
const ProductGrid = dynamic(() => import('@/components/product-grid').then(m => ({ default: m.ProductGrid })), { loading: () => <PageLoader /> })
const ProductDetail = dynamic(() => import('@/components/product-detail').then(m => ({ default: m.ProductDetail })), { loading: () => <PageLoader /> })
const CartView = dynamic(() => import('@/components/cart-view').then(m => ({ default: m.CartView })), { loading: () => <PageLoader /> })
const CheckoutView = dynamic(() => import('@/components/checkout-view').then(m => ({ default: m.CheckoutView })), { loading: () => <PageLoader /> })
const OrderConfirmation = dynamic(() => import('@/components/order-confirmation').then(m => ({ default: m.OrderConfirmation })), { loading: () => <PageLoader /> })
const AdminDashboard = dynamic(() => import('@/components/admin-dashboard').then(m => ({ default: m.AdminDashboard })), { loading: () => <PageLoader /> })
const LoginForm = dynamic(() => import('@/components/auth/login-form').then(m => ({ default: m.LoginForm })), { loading: () => <PageLoader /> })
const SignupForm = dynamic(() => import('@/components/auth/signup-form').then(m => ({ default: m.SignupForm })), { loading: () => <PageLoader /> })
const AccountView = dynamic(() => import('@/components/account-view').then(m => ({ default: m.AccountView })), { loading: () => <PageLoader /> })

function ProgressiveHome() {
  const [visibleSections, setVisibleSections] = useState(1)
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.homepageSections)) {
          const map: Record<string, boolean> = {}
          for (const s of data.homepageSections) {
            map[s.key] = s.enabled !== false
          }
          setEnabled(map)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleSections(2), 100),
      setTimeout(() => setVisibleSections(3), 200),
      setTimeout(() => setVisibleSections(4), 350),
      setTimeout(() => setVisibleSections(5), 500),
      setTimeout(() => setVisibleSections(6), 650),
      setTimeout(() => setVisibleSections(7), 800),
      setTimeout(() => setVisibleSections(8), 950),
      setTimeout(() => setVisibleSections(9), 1100),
      setTimeout(() => setVisibleSections(10), 1250),
      setTimeout(() => setVisibleSections(11), 1400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const show = (key: string) => enabled[key] !== false
  const showTrendSection = show('newInTrend') || show('newArrivals')

  return (
    <>
      {show('hero') && <HeroSection />}
      {visibleSections >= 2 && show('featuredCollections') && <FeaturedCollections />}
      {visibleSections >= 3 && show('promoBanners') && <PromoBanners />}
      {visibleSections >= 4 && showTrendSection && (
        <NewInTrend
          showTrend={show('newInTrend')}
          showArrivals={show('newArrivals')}
        />
      )}
      {visibleSections >= 5 && show('stories') && <StoriesSection />}
      {visibleSections >= 6 && show('backpackSeries') && <BackpackSeries />}
      {visibleSections >= 7 && show('bagTheVibe') && <BagTheVibe />}
      {visibleSections >= 8 && show('luxeLeather') && <LuxeLeatherBags />}
      {visibleSections >= 9 && show('toteBackpack') && <ToteBackpack />}
      {visibleSections >= 10 && show('ownItLeadIt') && <OwnItLeadIt />}
      {visibleSections >= 11 && show('trustBar') && <TrustBar />}
    </>
  )
}

function ViewRenderer({ view }: { view: string }) {
  const { user, setView } = useStore()

  useEffect(() => {
    if (view !== 'admin') return
    if (!user) {
      setView('login', { replace: true })
      return
    }
    if (user.role !== 'admin') {
      setView('home', { replace: true })
    }
  }, [view, user, setView])

  const authRequired = view === 'account' || view === 'admin'

  if (authRequired && !user) {
    return <PageLoader />
  }

  if (view === 'admin' && user?.role !== 'admin') {
    return <PageLoader />
  }

  switch (view) {
    case 'home':
      return <ProgressiveHome />
    case 'shop':
      return <ProductGrid />
    case 'product':
      return <ProductDetail />
    case 'cart':
      return <CartView />
    case 'checkout':
      return <CheckoutView />
    case 'confirmation':
      return <OrderConfirmation />
    case 'admin':
      return <AdminDashboard />
    case 'login':
      return <LoginForm />
    case 'signup':
      return <SignupForm />
    case 'account':
      return <AccountView />
    default:
      return null
  }
}

interface AppShellProps {
  collectionSlug?: string[]
}

function AppShellInner({ collectionSlug }: AppShellProps) {
  const view = useStore((s) => s.view)
  const applyShopRoute = useStore((s) => s.applyShopRoute)
  const applyRouteState = useStore((s) => s.applyRouteState)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const storeHydrated = useStoreHydration()
  const [routeReady, setRouteReady] = useState(false)

  useEffect(() => {
    registerAppNavigator((path, mode) => {
      if (mode === 'replace') router.replace(path)
      else router.push(path)
    })
  }, [router])

  useLayoutEffect(() => {
    if (!storeHydrated) return
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : ''
    const parsed = parseAppPath(pathname, search)
    if (parsed) {
      applyRouteState({
        view: parsed.view,
        productId: parsed.productId,
        accountTab: parsed.accountTab,
        orderId: parsed.orderId,
      })
    }
    setRouteReady(true)
  }, [storeHydrated, pathname, searchParams, applyRouteState])

  useEffect(() => {
    if (!storeHydrated || collectionSlug === undefined) return
    const params = parseShopSlug(collectionSlug)
    applyShopRoute(params)
  }, [storeHydrated, collectionSlug, applyShopRoute])

  useEffect(() => {
    const onPopState = () => {
      const parsed = parseAppPath(
        window.location.pathname,
        window.location.search
      )
      if (parsed) {
        applyRouteState({
          view: parsed.view,
          productId: parsed.productId,
          accountTab: parsed.accountTab,
          orderId: parsed.orderId,
        })
      }
      if (window.location.pathname.startsWith('/collections')) {
        const slug = window.location.pathname
          .replace(/^\/collections\/?/, '')
          .split('/')
          .filter(Boolean)
        applyShopRoute(parseShopSlug(slug))
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [applyRouteState, applyShopRoute])

  const hideChrome = view === 'admin'
  const ready = storeHydrated && routeReady

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-clip">
      <AuthGuard>
        {!hideChrome && <Header />}
        <main className="flex-1 min-w-0">
          {!ready ? <PageLoader /> : <ViewRenderer view={view} />}
        </main>
        {!hideChrome && <Footer />}
        {!hideChrome && <WhatsAppFloat />}
      </AuthGuard>
    </div>
  )
}

export function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AppShellInner {...props} />
    </Suspense>
  )
}
