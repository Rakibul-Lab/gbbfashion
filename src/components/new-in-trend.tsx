'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useCurrency } from '@/hooks/use-currency'
import {
  productImageContainerClass,
  productImageFitClass,
  PRODUCT_CAROUSEL_SCROLL,
} from '@/lib/product-image'
import { AddToCartPlus } from '@/components/add-to-cart-plus'
import { ProductColorSwatches } from '@/components/product-color-swatches'
import {
  resolveProductColorVariants,
  type ProductColorVariant,
} from '@/lib/product-colors'

type TrendTab = 'trend' | 'arrivals'

type ApiProduct = {
  id: string
  name: string
  slug?: string | null
  price: number
  originalPrice?: number | null
  image: string
  secondaryImage?: string | null
  galleryImages?: string | null
  colors?: string | null
  isNewArrival?: boolean
  isPrimeDrop?: boolean
  isFeatured?: boolean
  hasFlash?: boolean
  badge?: string | null
}

function TrendProductCard({
  product,
  index,
  badge,
}: {
  product: ApiProduct
  index: number
  badge: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const variants = useMemo(() => resolveProductColorVariants(product), [product])
  const [selected, setSelected] = useState<ProductColorVariant | null>(null)
  const active = selected || variants[0]
  const displayImage = active?.image || product.image
  const { openProduct } = useShopNavigation()
  const { format } = useCurrency()
  const original = product.originalPrice || product.price
  const discountPercent =
    original > product.price
      ? Math.round(((original - product.price) / original) * 100)
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative snap-start w-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() =>
        void openProduct({ id: product.id, slug: product.slug, name: product.name })
      }
    >
      <div className={`${productImageContainerClass} mb-3 rounded-sm`}>
        <img
          src={displayImage}
          alt={product.name}
          className={`w-full h-full ${productImageFitClass} transition-transform duration-700 ease-out group-hover:scale-105`}
          loading="lazy"
        />
        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-black rounded-sm">
          {badge}
        </span>
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-rose-600 rounded-sm">
            Save {discountPercent}%
          </span>
        )}
        <div
          className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute bottom-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
          <AddToCartPlus
            productId={product.id}
            name={product.name}
            price={product.price}
            image={displayImage}
            color={active?.name}
            colorSwatch={active?.swatch}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-rose-600">
            {format(product.price)}
          </span>
          {original > product.price && (
            <span className="text-xs text-slate-400 line-through">
              {format(original)}
            </span>
          )}
        </div>
        {variants.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <ProductColorSwatches
              variants={variants}
              selectedName={active?.name || ''}
              onSelect={setSelected}
              size="sm"
              stopPropagation
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface NewInTrendProps {
  showTrend?: boolean
  showArrivals?: boolean
}

export function NewInTrend({
  showTrend = true,
  showArrivals = true,
}: NewInTrendProps) {
  const { goToShop } = useShopNavigation()
  const tabs = useMemo(() => {
    const list: { value: TrendTab; label: string }[] = []
    if (showTrend) list.push({ value: 'trend', label: 'NEW IN TREND' })
    if (showArrivals) list.push({ value: 'arrivals', label: 'NEW ARRIVALS' })
    return list
  }, [showTrend, showArrivals])

  const [activeTab, setActiveTab] = useState<TrendTab>(
    showTrend ? 'trend' : 'arrivals'
  )
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    if (tabs.length === 0) return
    if (!tabs.some((t) => t.value === activeTab)) {
      setActiveTab(tabs[0].value)
    }
  }, [tabs, activeTab])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/products', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return
        setProducts(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    if (activeTab === 'arrivals') {
      return products.filter((p) => p.isNewArrival === true)
    }
    // New In Trend — featured / prime / flash pieces
    return products.filter(
      (p) => p.isFeatured === true || p.isPrimeDrop === true || p.hasFlash === true
    )
  }, [activeTab, products])

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll, filteredProducts])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
      setTimeout(checkScroll, 100)
    }
  }, [activeTab, checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -PRODUCT_CAROUSEL_SCROLL : PRODUCT_CAROUSEL_SCROLL,
        behavior: 'smooth',
      })
    }
  }

  if (!showTrend && !showArrivals) return null

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-stone-50">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {tabs.length > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 sm:mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`relative text-lg sm:text-3xl lg:text-4xl tracking-tight transition-all duration-300 pb-2 ${
                  activeTab === tab.value
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-300 font-medium hover:text-slate-500'
                }`}
              >
                {tab.label}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="trend-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>
        ) : (
          <h2 className="text-center text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-10 sm:mb-12">
            {tabs[0]?.label}
          </h2>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-slate-500 py-12 text-sm">
            No products flagged for this section yet. Mark products as{' '}
            {activeTab === 'arrivals' ? 'New Arrivals' : 'Featured / Prime Drop'} in Admin.
          </p>
        ) : (
          <div className="relative group/carousel">
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all text-slate-600 hover:text-slate-900"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <div
              ref={scrollRef}
              className="flex gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 lg:gap-5 sm:contents"
                >
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="snap-start shrink-0 w-[70vw] min-w-[200px] max-w-[300px] sm:w-full sm:min-w-0 sm:max-w-none"
                    >
                      <TrendProductCard
                        product={product}
                        index={index}
                        badge={activeTab === 'arrivals' ? 'NEW' : 'TRENDING'}
                      />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all text-slate-600 hover:text-slate-900"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex justify-center mt-8 sm:mt-10">
          <Button
            onClick={() =>
              goToShop({
                category: activeTab === 'arrivals' ? 'new-arrivals' : 'prime-drop',
              })
            }
            variant="outline"
            className="px-10 py-2.5 text-sm font-semibold tracking-widest uppercase border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 rounded-sm group"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
