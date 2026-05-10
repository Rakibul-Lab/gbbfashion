'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AuthGuard } from '@/components/auth-guard'

// Lightweight loading components
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

// Lazy load components using dynamic import with ssr: false
// This prevents server-side compilation of heavy components
import dynamic from 'next/dynamic'

const HeroSection = dynamic(() => import('@/components/hero-section').then(m => ({ default: m.HeroSection })), { ssr: false, loading: SectionLoader })
const FeaturedCollections = dynamic(() => import('@/components/featured-collections').then(m => ({ default: m.FeaturedCollections })), { ssr: false, loading: SectionLoader })
const PromoBanners = dynamic(() => import('@/components/promo-banners').then(m => ({ default: m.PromoBanners })), { ssr: false, loading: SectionLoader })
const NewInTrend = dynamic(() => import('@/components/new-in-trend').then(m => ({ default: m.NewInTrend })), { ssr: false, loading: SectionLoader })
const StoriesSection = dynamic(() => import('@/components/stories-section').then(m => ({ default: m.StoriesSection })), { ssr: false, loading: SectionLoader })
const BackpackSeries = dynamic(() => import('@/components/backpack-series').then(m => ({ default: m.BackpackSeries })), { ssr: false, loading: SectionLoader })
const BagTheVibe = dynamic(() => import('@/components/bag-the-vibe').then(m => ({ default: m.BagTheVibe })), { ssr: false, loading: SectionLoader })
const LuxeLeatherBags = dynamic(() => import('@/components/luxe-leather-bags').then(m => ({ default: m.LuxeLeatherBags })), { ssr: false, loading: SectionLoader })
const ToteBackpack = dynamic(() => import('@/components/tote-backpack').then(m => ({ default: m.ToteBackpack })), { ssr: false, loading: SectionLoader })
const OwnItLeadIt = dynamic(() => import('@/components/own-it-lead-it').then(m => ({ default: m.OwnItLeadIt })), { ssr: false, loading: SectionLoader })
const TrustBar = dynamic(() => import('@/components/trust-bar').then(m => ({ default: m.TrustBar })), { ssr: false, loading: SectionLoader })
const ProductGrid = dynamic(() => import('@/components/product-grid').then(m => ({ default: m.ProductGrid })), { ssr: false, loading: () => <PageLoader /> })
const ProductDetail = dynamic(() => import('@/components/product-detail').then(m => ({ default: m.ProductDetail })), { ssr: false, loading: () => <PageLoader /> })
const CartView = dynamic(() => import('@/components/cart-view').then(m => ({ default: m.CartView })), { ssr: false, loading: () => <PageLoader /> })
const CheckoutView = dynamic(() => import('@/components/checkout-view').then(m => ({ default: m.CheckoutView })), { ssr: false, loading: () => <PageLoader /> })
const OrderConfirmation = dynamic(() => import('@/components/order-confirmation').then(m => ({ default: m.OrderConfirmation })), { ssr: false, loading: () => <PageLoader /> })
const AdminDashboard = dynamic(() => import('@/components/admin-dashboard').then(m => ({ default: m.AdminDashboard })), { ssr: false, loading: () => <PageLoader /> })
const LoginForm = dynamic(() => import('@/components/auth/login-form').then(m => ({ default: m.LoginForm })), { ssr: false, loading: () => <PageLoader /> })
const SignupForm = dynamic(() => import('@/components/auth/signup-form').then(m => ({ default: m.SignupForm })), { ssr: false, loading: () => <PageLoader /> })

// Progressive section loader - only loads sections as they become visible
function ProgressiveHome() {
  const [visibleSections, setVisibleSections] = useState(1)

  useEffect(() => {
    // Progressively load sections with delays to reduce memory pressure
    const timers = [
      setTimeout(() => setVisibleSections(2), 500),
      setTimeout(() => setVisibleSections(3), 1000),
      setTimeout(() => setVisibleSections(4), 1500),
      setTimeout(() => setVisibleSections(5), 2000),
      setTimeout(() => setVisibleSections(6), 2500),
      setTimeout(() => setVisibleSections(7), 3000),
      setTimeout(() => setVisibleSections(8), 3500),
      setTimeout(() => setVisibleSections(9), 4000),
      setTimeout(() => setVisibleSections(10), 4500),
      setTimeout(() => setVisibleSections(11), 5000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <>
      <HeroSection />
      {visibleSections >= 2 && <FeaturedCollections />}
      {visibleSections >= 3 && <PromoBanners />}
      {visibleSections >= 4 && <NewInTrend />}
      {visibleSections >= 5 && <StoriesSection />}
      {visibleSections >= 6 && <BackpackSeries />}
      {visibleSections >= 7 && <BagTheVibe />}
      {visibleSections >= 8 && <LuxeLeatherBags />}
      {visibleSections >= 9 && <ToteBackpack />}
      {visibleSections >= 10 && <OwnItLeadIt />}
      {visibleSections >= 11 && <TrustBar />}
    </>
  )
}

function ViewRenderer({ view }: { view: string }) {
  const { user, setView } = useStore()

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
    default:
      return null
  }
}

export default function Home() {
  const view = useStore((s) => s.view)

  useEffect(() => {
    fetch('/api/seed', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => console.log('Seed result:', data.message))
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
