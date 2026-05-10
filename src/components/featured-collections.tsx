'use client'

import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  rating: number
  badge: string | null
  category: string
}

type CollectionTab = 'bags' | 'shoes'

const tabs: { value: CollectionTab; label: string }[] = [
  { value: 'bags', label: 'Prime Bags' },
  { value: 'shoes', label: 'Prime Shoes' },
]

// Generate a deterministic "original price" for display purposes
function getOriginalPrice(price: number, id: string): number {
  // Use a simple hash of the id to get a consistent multiplier between 1.3 and 2.5
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  const multiplier = 1.3 + (Math.abs(hash) % 120) / 100 // 1.3 to 2.5
  return Math.round(price * multiplier * 100) / 100
}

function getDiscountPercent(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : star - 0.5 <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'fill-slate-100 text-slate-200'
          }`}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating}</span>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { selectProduct, setView, addToCart } = useStore()
  const originalPrice = getOriginalPrice(product.price, product.id)
  const discountPercent = getDiscountPercent(product.price, originalPrice)

  return (
    <div className="snap-start shrink-0 w-[220px] sm:w-[240px]">
      <div className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
        {/* Image container */}
        <div
          className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer"
          onClick={() => {
            selectProduct(product.id)
            setView('product')
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Sale badge */}
          <Badge className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5 border-0 rounded-md hover:bg-rose-600">
            Save {discountPercent}%
          </Badge>

          {/* Quick add to cart - shown on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }}
              className="w-full rounded-none bg-amber-700 hover:bg-amber-800 text-white h-9 text-sm font-medium gap-2"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3
            className="font-medium text-sm text-slate-900 line-clamp-1 cursor-pointer hover:text-amber-700 transition-colors"
            onClick={() => {
              selectProduct(product.id)
              setView('product')
            }}
          >
            {product.name}
          </h3>

          <div className="mt-1.5">
            <StarRating rating={product.rating} />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-slate-400 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeaturedCollections() {
  const { setView, setCategoryFilter } = useStore()
  const [activeTab, setActiveTab] = useState<CollectionTab>('bags')
  const [products, setProducts] = useState<Product[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error)
  }, [])

  const filteredProducts = useMemo(() => {
    if (activeTab === 'bags') {
      return products.filter((p) => p.category === 'women' || p.category === 'men')
    }
    return products.filter((p) => p.category === 'shoes')
  }, [products, activeTab])

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

  // Reset scroll position when tab changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
      checkScroll()
    }
  }, [activeTab, checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 500
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleViewAll = () => {
    if (activeTab === 'bags') {
      setCategoryFilter('women')
    } else {
      setCategoryFilter('shoes')
    }
    setView('shop')
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`relative text-2xl sm:text-3xl tracking-wide transition-all duration-300 pb-2 ${
                activeTab === tab.value
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-300 font-normal hover:text-slate-500'
              }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <motion.div
                  layoutId="featured-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-shadow text-slate-600 hover:text-amber-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          )}

          {/* Scrollable area */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex gap-4"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-shadow text-slate-600 hover:text-amber-700"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          )}
        </div>

        {/* View All button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleViewAll}
            variant="outline"
            className="px-8 py-2.5 text-sm font-semibold tracking-wider uppercase border-slate-300 text-slate-700 hover:border-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all duration-300 rounded-full"
          >
            View All
          </Button>
        </div>
      </div>
    </section>
  )
}
