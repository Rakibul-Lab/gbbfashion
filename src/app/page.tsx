'use client'

import { useEffect, lazy, Suspense } from 'react'
import { useStore, ViewType } from '@/lib/store'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthGuard } from '@/components/auth-guard'

// Dynamic imports for ALL views to reduce initial bundle
const HeroSection = lazy(() => import('@/components/hero-section').then(m => ({ default: m.HeroSection })))
const FeaturedCollections = lazy(() => import('@/components/featured-collections').then(m => ({ default: m.FeaturedCollections })))
const PromoBanners = lazy(() => import('@/components/promo-banners').then(m => ({ default: m.PromoBanners })))
const NewInTrend = lazy(() => import('@/components/new-in-trend').then(m => ({ default: m.NewInTrend })))
const StoriesSection = lazy(() => import('@/components/stories-section').then(m => ({ default: m.StoriesSection })))
const BackpackSeries = lazy(() => import('@/components/backpack-series').then(m => ({ default: m.BackpackSeries })))
const BagTheVibe = lazy(() => import('@/components/bag-the-vibe').then(m => ({ default: m.BagTheVibe })))
const LuxeLeatherBags = lazy(() => import('@/components/luxe-leather-bags').then(m => ({ default: m.LuxeLeatherBags })))
const ToteBackpack = lazy(() => import('@/components/tote-backpack').then(m => ({ default: m.ToteBackpack })))
const OwnItLeadIt = lazy(() => import('@/components/own-it-lead-it').then(m => ({ default: m.OwnItLeadIt })))
const TrustBar = lazy(() => import('@/components/trust-bar').then(m => ({ default: m.TrustBar })))
const ProductGrid = lazy(() => import('@/components/product-grid').then(m => ({ default: m.ProductGrid })))
const ProductDetail = lazy(() => import('@/components/product-detail').then(m => ({ default: m.ProductDetail })))
const CartView = lazy(() => import('@/components/cart-view').then(m => ({ default: m.CartView })))
const CheckoutView = lazy(() => import('@/components/checkout-view').then(m => ({ default: m.CheckoutView })))
const OrderConfirmation = lazy(() => import('@/components/order-confirmation').then(m => ({ default: m.OrderConfirmation })))
const AdminDashboard = lazy(() => import('@/components/admin-dashboard').then(m => ({ default: m.AdminDashboard })))
const LoginForm = lazy(() => import('@/components/auth/login-form').then(m => ({ default: m.LoginForm })))
const SignupForm = lazy(() => import('@/components/auth/signup-form').then(m => ({ default: m.SignupForm })))

function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
    </div>
  )
}

function SectionLoader() {
  return (
    <div className="h-48 flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-amber-600" />
    </div>
  )
}

function ViewRenderer({ view }: { view: ViewType }) {
  const { user, setView } = useStore()

  // Protect admin view: require authentication and admin role
  if (view === 'admin') {
    if (!user) {
      setView('login')
      return null
    }
    if (user.role !== 'admin') {
      setView('home')
      return null
    }
  }

  switch (view) {
    case 'home':
      return (
        <>
          <Suspense fallback={<SectionLoader />}><HeroSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><FeaturedCollections /></Suspense>
          <Suspense fallback={<SectionLoader />}><PromoBanners /></Suspense>
          <Suspense fallback={<SectionLoader />}><NewInTrend /></Suspense>
          <Suspense fallback={<SectionLoader />}><StoriesSection /></Suspense>
          <Suspense fallback={<SectionLoader />}><BackpackSeries /></Suspense>
          <Suspense fallback={<SectionLoader />}><BagTheVibe /></Suspense>
          <Suspense fallback={<SectionLoader />}><LuxeLeatherBags /></Suspense>
          <Suspense fallback={<SectionLoader />}><ToteBackpack /></Suspense>
          <Suspense fallback={<SectionLoader />}><OwnItLeadIt /></Suspense>
          <Suspense fallback={<SectionLoader />}><TrustBar /></Suspense>
        </>
      )
    case 'shop':
      return <Suspense fallback={<LoadingSpinner />}><ProductGrid /></Suspense>
    case 'product':
      return <Suspense fallback={<LoadingSpinner />}><ProductDetail /></Suspense>
    case 'cart':
      return <Suspense fallback={<LoadingSpinner />}><CartView /></Suspense>
    case 'checkout':
      return <Suspense fallback={<LoadingSpinner />}><CheckoutView /></Suspense>
    case 'confirmation':
      return <Suspense fallback={<LoadingSpinner />}><OrderConfirmation /></Suspense>
    case 'admin':
      return <Suspense fallback={<LoadingSpinner />}><AdminDashboard /></Suspense>
    case 'login':
      return <Suspense fallback={<LoadingSpinner />}><LoginForm /></Suspense>
    case 'signup':
      return <Suspense fallback={<LoadingSpinner />}><SignupForm /></Suspense>
    default:
      return null
  }
}

export default function Home() {
  const view = useStore((s) => s.view)

  // Seed database on first load
  useEffect(() => {
    fetch('/api/seed', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        console.log('Seed result:', data.message)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthGuard>
        <Header />
        <main className="flex-1">
          <ViewRenderer view={view} />
        </main>
        <Footer />
      </AuthGuard>
    </div>
  )
}
