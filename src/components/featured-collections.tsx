'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { featuredProducts, type FeaturedProduct, type ColorVariant } from '@/lib/featured-products'
import { productCardWidthClass, productImageContainerClass, productImageFitClass, PRODUCT_CAROUSEL_SCROLL } from '@/lib/product-image'
import { AddToCartPlus } from '@/components/add-to-cart-plus'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useCurrency } from '@/hooks/use-currency'

type CollectionTab = 'bags' | 'shoes'

const tabs: { value: CollectionTab; label: string }[] = [
  { value: 'bags', label: 'Prime Bags' },
  { value: 'shoes', label: 'Prime Shoes' },
]

// Color swatch component
function ColorSwatches({ colors, selectedColor, onColorSelect }: { colors: ColorVariant[]; selectedColor: number; onColorSelect: (index: number) => void }) {
  return (
    <fieldset className="flex items-center justify-center flex-wrap gap-1.5 mt-2.5">
      <legend className="sr-only">Color</legend>
      {colors.map((color, index) => (
        <button
          key={color.name}
          onClick={(e) => {
            e.stopPropagation()
            onColorSelect(index)
          }}
          className={`relative rounded-full transition-all duration-200 ${
            selectedColor === index
              ? 'ring-2 ring-offset-1 ring-slate-900 scale-110'
              : 'ring-1 ring-slate-200 hover:ring-slate-400'
          }`}
          style={{ width: '20px', height: '20px' }}
          title={color.name}
          aria-label={color.name}
        >
          <span
            className="block w-full h-full rounded-full border border-white/50"
            style={{ backgroundColor: color.swatch }}
          />
          {selectedColor === index && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg width="8" height="6" viewBox="0 0 8 6" className="drop-shadow-sm">
                <path
                  d="M1 3l2 2 4-4"
                  stroke={color.swatch === '#1a1a1a' || color.swatch === '#3a3a3a' ? '#fff' : '#000'}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </button>
      ))}
    </fieldset>
  )
}

// Product Card
function ProductCard({ product, index }: { product: FeaturedProduct; index: number }) {
  const [selectedColor, setSelectedColor] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const { openProduct } = useShopNavigation()
  const { format } = useCurrency()

  const activeColor = product.colors[selectedColor] ?? product.colors[0]
  const displayImage = activeColor?.thumbnail || product.image
  const hoverImage = product.secondaryImage || product.image
  // Only use hover swap when viewing the default color (so color picks stay visible)
  const showHoverSwap = isHovered && selectedColor === 0 && hoverImage !== displayImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`snap-start ${productCardWidthClass} cursor-pointer`}
      onClick={() => void openProduct({ id: product.id, name: product.name })}
    >
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className={`${productImageContainerClass} rounded-sm`}>
          <img
            key={displayImage}
            src={displayImage}
            alt={`${product.name}${activeColor ? ` — ${activeColor.name}` : ''}`}
            className={`w-full h-full ${productImageFitClass} transition-opacity duration-300 ${
              showHoverSwap ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {selectedColor === 0 && (
            <img
              src={hoverImage}
              alt={product.name}
              className={`absolute inset-0 w-full h-full ${productImageFitClass} transition-opacity duration-300 ${
                showHoverSwap ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}

          {/* Trending Badge - Top Left */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase text-white bg-black rounded-sm leading-tight">
              Trending
            </span>
          </div>

          {/* Sale Badge - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-rose-600 rounded-sm leading-tight">
              Save {product.discountPercent}%
            </span>
            {product.hasFlash && (
              <div className="flex items-center justify-center w-5 h-5 bg-amber-400 rounded-full">
                <Zap className="w-3 h-3 text-amber-900 fill-amber-900" />
              </div>
            )}
          </div>

          <div className="absolute bottom-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <AddToCartPlus
              productId={product.id}
              name={product.name}
              price={product.price}
              image={displayImage}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-3 pb-1">
          <div className="flex flex-col items-center gap-1.5">
            <h3 className="text-sm font-semibold text-slate-900 text-center line-clamp-2 leading-tight px-1">
              {product.name}
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-rose-600">
                {product.priceFrom && 'From '}{format(product.price)}
              </span>
              <span className="text-sm text-slate-400 line-through">
                {format(product.originalPrice)}
              </span>
            </div>

            <ColorSwatches
              colors={product.colors}
              selectedColor={selectedColor}
              onColorSelect={(index) => {
                setSelectedColor(index)
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function FeaturedCollections() {
  const [activeTab, setActiveTab] = useState<CollectionTab>('bags')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const filteredProducts = useMemo(
    () => featuredProducts.filter((p) => p.collection === activeTab),
    [activeTab]
  )

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
      // Small delay to allow re-render before checking scroll
      setTimeout(checkScroll, 100)
    }
  }, [activeTab, checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = PRODUCT_CAROUSEL_SCROLL
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
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
                  layoutId="featured-tab-underline"
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
                className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all text-slate-600 hover:text-slate-900"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrollable Product List */}
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

          {/* Next Button */}
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

        {/* View All Button */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <Button
            variant="outline"
            className="px-10 py-2.5 text-sm font-semibold tracking-widest uppercase border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 rounded-sm"
          >
            View all
          </Button>
        </div>
      </div>
    </section>
  )
}
