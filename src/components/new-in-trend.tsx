'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Zap, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { featuredProducts } from '@/lib/featured-products'

// Trending products - mix of bags and shoes
const trendingProducts = [
  ...featuredProducts.filter(p => p.hasFlash).slice(0, 4),
  ...featuredProducts.filter(p => !p.hasFlash).slice(0, 4),
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

function TrendProductCard({ product, index }: { product: typeof trendingProducts[0]; index: number }) {
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
        {/* Sale Badge */}
        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-rose-600 rounded-sm">
          Save {product.discountPercent}%
        </span>
        {/* Flash Badge */}
        {product.hasFlash && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-amber-400 rounded-full px-1.5 py-0.5">
              <Zap className="w-2.5 h-2.5 text-amber-900 fill-amber-900" />
              <span className="text-[8px] font-bold text-amber-900 uppercase">Flash</span>
            </div>
          </div>
        )}
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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
  }, [checkScroll])

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
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-600 mb-2 block">
              What&apos;s Hot
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              New in Trend
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden sm:flex items-center gap-2"
          >
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Product Grid - scrollable on mobile, grid on desktop */}
        <div
          ref={scrollRef}
          className="flex gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trendingProducts.map((product, index) => (
            <div key={product.id} className="snap-start shrink-0 w-[220px] sm:w-auto">
              <TrendProductCard product={product} index={index} />
            </div>
          ))}
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
