'use client'

import { useStore, ProductTab } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { primeDropBadges } from '@/lib/categories'

interface Product {
  id: string
  name: string
  price: number
  image: string
  rating: number
  badge: string | null
  category: string
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'New': 'bg-teal-100 text-teal-700 border-teal-200',
  'Premium': 'bg-amber-100 text-amber-700 border-amber-200',
  'Popular': 'bg-rose-100 text-rose-700 border-rose-200',
}

const tabs: { value: ProductTab; label: string }[] = [
  { value: 'new', label: 'NEW IN TREND' },
  { value: 'prime', label: 'PRIME DROP' },
]

export function PopularProducts() {
  const { setView, selectProduct, addToCart, productTab, setProductTab } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error)
  }, [])

  const filteredProducts = useMemo(() => {
    if (productTab === 'new') {
      return products.filter((p) => p.badge === 'New' || p.badge === null)
    } else {
      return products.filter((p) => p.badge && primeDropBadges.includes(p.badge))
    }
  }, [products, productTab])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Jost, sans-serif' }}>Popular Products</h2>
          </div>
          <button
            onClick={() => setView('shop')}
            className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1"
          >
            Explore All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setProductTab(tab.value)}
              className={`relative px-5 py-3 text-sm font-semibold tracking-wider transition-colors ${
                productTab === tab.value
                  ? 'text-amber-700'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              style={{ fontFamily: 'Jost, sans-serif' }}
            >
              {tab.label}
              {productTab === tab.value && (
                <motion.div
                  layoutId="product-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow text-slate-600 hover:text-amber-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="snap-start shrink-0 w-[220px] sm:w-[240px]"
              >
                <div className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
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
                    {product.badge && (
                      <Badge
                        className={`absolute top-2.5 left-2.5 text-[10px] ${badgeColors[product.badge] || 'bg-slate-100 text-slate-700'}`}
                      >
                        {product.badge}
                      </Badge>
                    )}
                  </div>

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
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-slate-500">{product.rating}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-base font-bold text-amber-700">
                        ${product.price.toLocaleString()}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                          })
                        }
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-8 w-8 p-0"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow text-slate-600 hover:text-amber-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
