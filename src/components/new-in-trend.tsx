'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { featuredProducts, type FeaturedProduct } from '@/lib/featured-products'

type TrendTab = 'trend' | 'arrivals'

const tabs: { value: TrendTab; label: string }[] = [
  { value: 'trend', label: 'NEW IN TREND' },
  { value: 'arrivals', label: 'NEW ARRIVALS' },
]

// Custom Star Rating
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.3

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" role="img" aria-label={`${rating} out of 5.0 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            aria-hidden="true"
            focusable="false"
            width="12"
            height="11"
            viewBox="0 0 12 11"
            className="inline-block"
          >
            {star <= fullStars ? (
              <path
                d="M6 0v8.635L2.292 11 3.48 6.87 0 4.202l4.443-.187L6 0Zm0 0v8.635L9.708 11 8.52 6.87 12 4.202l-4.443-.187L6 0Z"
                fill="#c9a66b"
              />
            ) : star === fullStars + 1 && hasHalf ? (
              <>
                <path d="M6 0v8.635L2.292 11 3.48 6.87 0 4.202l4.443-.187L6 0Z" fill="#c9a66b" />
                <path d="M6 0v8.635L9.708 11 8.52 6.87 12 4.202l-4.443-.187L6 0Z" fillOpacity="0.4" fill="#c9a66b" />
              </>
            ) : (
              <path
                d="M6 0v8.635L2.292 11 3.48 6.87 0 4.202l4.443-.187L6 0Zm0 0v8.635L9.708 11 8.52 6.87 12 4.202l-4.443-.187L6 0Z"
                fillOpacity="0.4"
                fill="#c9a66b"
              />
            )}
          </svg>
        ))}
      </div>
      <span className="text-[10px] tracking-wide text-slate-400">({rating})</span>
    </div>
  )
}

function TrendProductCard({ product, index }: { product: FeaturedProduct; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* TRENDING Badge - top left */}
        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-black rounded-sm">
          TRENDING
        </span>
        {/* Sale Badge - top right */}
        <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-rose-600 rounded-sm">
          Save {product.discountPercent}%
        </span>
        {/* Quick View overlay */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-rose-600">
            {product.priceFrom && 'From '}৳{product.price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 line-through">
            ৳{product.originalPrice.toLocaleString()}
          </span>
        </div>
        <StarRating rating={product.rating} />
      </div>
    </motion.div>
  )
}

export function NewInTrend() {
  const { setView, setCategoryFilter } = useStore()
  const [activeTab, setActiveTab] = useState<TrendTab>('trend')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const filteredProducts = useMemo(() => {
    if (activeTab === 'trend') {
      return featuredProducts.filter((p) => p.hasFlash)
    }
    return featuredProducts.filter((p) => !p.hasFlash)
  }, [activeTab])

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
        left: direction === 'left' ? -480 : 480,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation - same style as FeaturedCollections */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10 sm:mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative text-2xl sm:text-3xl lg:text-4xl tracking-tight transition-all duration-300 pb-2 ${
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

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Previous Button */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all text-slate-600 hover:text-slate-900"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Product Grid - scrollable on mobile, grid on desktop */}
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
                  <div key={product.id} className="snap-start shrink-0 w-[220px] sm:w-auto">
                    <TrendProductCard product={product} index={index} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all text-slate-600 hover:text-slate-900"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* View All */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <Button
            onClick={() => { setCategoryFilter('all'); setView('shop') }}
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
