'use client'

import { useEffect } from 'react'
import { useStore, ViewType } from '@/lib/store'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { PromoBanners } from '@/components/promo-banners'
import { CategoryCards } from '@/components/category-cards'
import { PopularProducts } from '@/components/popular-products'
import { FeaturedCollections } from '@/components/featured-collections'
import { NewInTrend } from '@/components/new-in-trend'
import { CategoryShowcase } from '@/components/category-showcase'
import { StoriesSection } from '@/components/stories-section'
import { TrustBar } from '@/components/trust-bar'
import { ProductGrid } from '@/components/product-grid'
import { ProductDetail } from '@/components/product-detail'
import { CartView } from '@/components/cart-view'
import { CheckoutView } from '@/components/checkout-view'
import { OrderConfirmation } from '@/components/order-confirmation'
import { AdminDashboard } from '@/components/admin-dashboard'
import { motion, AnimatePresence } from 'framer-motion'

function ViewRenderer({ view }: { view: ViewType }) {
  switch (view) {
    case 'home':
      return (
        <>
          <HeroSection />
          <FeaturedCollections />
          <NewInTrend />
          <PromoBanners />
          <CategoryShowcase />
          <StoriesSection />
          <TrustBar />
        </>
      )
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
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ViewRenderer view={view} />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
