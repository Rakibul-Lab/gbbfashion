'use client'

import { useEffect } from 'react'
import { useStore, ViewType } from '@/lib/store'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { FeaturedCollections } from '@/components/featured-collections'
import { PromoBanners } from '@/components/promo-banners'
import { NewInTrend } from '@/components/new-in-trend'
import { StoriesSection } from '@/components/stories-section'
import { BackpackSeries } from '@/components/backpack-series'
import { BagTheVibe } from '@/components/bag-the-vibe'
import { LuxeLeatherBags } from '@/components/luxe-leather-bags'
import { ToteBackpack } from '@/components/tote-backpack'
import { OwnItLeadIt } from '@/components/own-it-lead-it'
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
          <PromoBanners />
          <NewInTrend />
          <StoriesSection />
          <BackpackSeries />
          <BagTheVibe />
          <LuxeLeatherBags />
          <ToteBackpack />
          <OwnItLeadIt />
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
