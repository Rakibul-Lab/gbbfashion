'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useCurrency } from '@/hooks/use-currency'
import {
  productCardWidthClass,
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

type ToteBackpackTab = 'tote' | 'backpack'

const tabs: { value: ToteBackpackTab; label: string; category: string; subCategory: string }[] = [
  { value: 'tote', label: 'TOTE', category: 'women', subCategory: 'tote-bag' },
  { value: 'backpack', label: 'BACKPACK', category: 'men', subCategory: 'bag-pack' },
]

type ApiProduct = {
  id: string
  name: string
  price: number
  originalPrice?: number | null
  image: string
  secondaryImage?: string | null
  galleryImages?: string | null
  colors?: string | null
  category?: string
  subCategory?: string | null
  badge?: string | null
  inStock?: boolean
}

function matchesTab(product: ApiProduct, tab: (typeof tabs)[number]) {
  const sub = (product.subCategory || '').toLowerCase()
  if (sub === tab.subCategory) return true
  // Fallback if subcategory not set — match category + name hint
  const name = product.name.toLowerCase()
  if (tab.value === 'tote') {
    return (
      (product.category === 'women' || product.category === 'accessories') &&
      name.includes('tote')
    )
  }
  return (
    (product.category === 'men' || product.category === 'kids') &&
    (name.includes('backpack') || name.includes('bag pack') || name.includes('bag-pack'))
  )
}

function ProductCard({ product, index }: { product: ApiProduct; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const variants = useMemo(() => resolveProductColorVariants(product), [product])
  const [selected, setSelected] = useState<ProductColorVariant | null>(null)
  const active = selected || variants[0]
  const displayImage = active?.image || product.image
  const hoverImage = product.secondaryImage || product.image
  const showHoverSwap =
    isHovered && (!selected || selected === variants[0]) && hoverImage !== displayImage
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
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`snap-start ${productCardWidthClass} cursor-pointer`}
      onClick={() => void openProduct({ id: product.id, name: product.name })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group relative">
        <div className={`${productImageContainerClass} rounded-sm`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={displayImage}
            src={displayImage}
            alt={product.name}
            className={`w-full h-full ${productImageFitClass} transition-opacity duration-300 ${
              showHoverSwap ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {hoverImage !== displayImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hoverImage}
              alt={product.name}
              className={`absolute inset-0 w-full h-full ${productImageFitClass} transition-opacity duration-300 ${
                showHoverSwap ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}

          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-white bg-black rounded-sm leading-tight">
              {product.badge || 'Trending'}
            </span>
          </div>

          {discountPercent > 0 && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-rose-600 rounded-sm leading-tight">
                Save {discountPercent}%
              </span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <AddToCartPlus
              productId={product.id}
              name={product.name}
              price={product.price}
              image={displayImage}
            />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <h3 className="text-sm font-medium text-slate-900 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-900">{format(product.price)}</span>
            {product.originalPrice != null && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {format(product.originalPrice)}
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
      </div>
    </motion.div>
  )
}

export function ToteBackpack() {
  const { goToShop } = useShopNavigation()
  const [activeTab, setActiveTab] = useState<ToteBackpackTab>('tote')
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const activeMeta = tabs.find((t) => t.value === activeTab) || tabs[0]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/products', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return
        setProducts(data)
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => matchesTab(p, activeMeta)).slice(0, 12)
  }, [products, activeMeta])

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

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 mb-10 sm:mb-12">
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
                  layoutId="tote-backpack-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-slate-500 py-12 text-sm max-w-md mx-auto">
            No {activeTab === 'tote' ? 'tote bag' : 'backpack'} products yet. Add products under
            Categories with subcategory{' '}
            <span className="font-mono text-slate-700">
              {activeMeta.subCategory}
            </span>{' '}
            in Admin → Products.
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
              className="flex gap-4 lg:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 lg:gap-6"
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
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
                category: activeMeta.category,
                subCategory: activeMeta.subCategory,
              })
            }
            variant="outline"
            className="px-10 py-2.5 text-sm font-semibold tracking-widest uppercase border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 rounded-sm"
          >
            Carry Confidence
          </Button>
        </div>
      </div>
    </section>
  )
}
