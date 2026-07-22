'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Zap, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  productCardWidthClass,
  productImageContainerClass,
  productImageFitClass,
  PRODUCT_CAROUSEL_SCROLL,
} from '@/lib/product-image'
import { AddToCartPlus } from '@/components/add-to-cart-plus'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useCurrency } from '@/hooks/use-currency'
import { resolveProductColorVariants } from '@/lib/product-colors'
import { normalizePrimeCollection } from '@/lib/prime-collection'
import { trackSelectItem, trackViewItemList } from '@/lib/gtm'
import { setPendingProductColor } from '@/lib/pending-product-color'

type CollectionTab = 'bags' | 'shoes'

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
  hasFlash?: boolean
  inStock?: boolean
  collection?: string | null
  category?: string
}

type ColorVariant = { name: string; swatch: string; thumbnail: string }

type PrimeCardProduct = {
  id: string
  slug?: string | null
  name: string
  price: number
  originalPrice: number
  discountPercent: number
  image: string
  secondaryImage: string
  hasFlash: boolean
  colors: ColorVariant[]
  collection: CollectionTab
}

const tabs: { value: CollectionTab; label: string }[] = [
  { value: 'bags', label: 'Prime Bags' },
  { value: 'shoes', label: 'Prime Shoes' },
]

function mapApiToCard(p: ApiProduct): PrimeCardProduct | null {
  const collection = normalizePrimeCollection(p.collection)
  if (!collection) return null

  const variants = resolveProductColorVariants(p)
  const colors: ColorVariant[] =
    variants.length > 0
      ? variants.map((v) => ({
          name: v.name,
          swatch: v.swatch,
          thumbnail: v.image || p.image,
        }))
      : [{ name: 'Default', swatch: '#888888', thumbnail: p.image }]

  const original = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price
  const discountPercent =
    original > p.price ? Math.round(((original - p.price) / original) * 100) : 0

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: original,
    discountPercent,
    image: p.image,
    secondaryImage: p.secondaryImage || p.image,
    hasFlash: Boolean(p.hasFlash),
    colors,
    collection,
  }
}

function ColorSwatches({
  colors,
  selectedColor,
  onColorSelect,
}: {
  colors: ColorVariant[]
  selectedColor: number | null
  onColorSelect: (index: number | null) => void
}) {
  if (colors.length <= 1) return null

  return (
    <fieldset className="flex items-center justify-center flex-wrap gap-1.5 mt-2.5">
      <legend className="sr-only">Color</legend>
      {colors.map((color, index) => (
        <button
          key={`${color.name}-${index}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            // Same color again → deselect → featured image
            onColorSelect(selectedColor === index ? null : index)
          }}
          className={`relative rounded-full transition-all duration-200 ${
            selectedColor === index
              ? 'ring-2 ring-offset-1 ring-slate-900 scale-110'
              : 'ring-1 ring-slate-200 hover:ring-slate-400'
          }`}
          style={{ width: '20px', height: '20px' }}
          title={
            selectedColor === index
              ? `${color.name} (click again to clear)`
              : color.name
          }
          aria-label={color.name}
        >
          <span
            className="block w-full h-full rounded-full border border-white/50"
            style={{ backgroundColor: color.swatch }}
          />
        </button>
      ))}
    </fieldset>
  )
}

function ProductCard({
  product,
  index,
  listId,
  listName,
}: {
  product: PrimeCardProduct
  index: number
  listId: string
  listName: string
}) {
  // null = no color picked → show main featured product.image
  const [selectedColor, setSelectedColor] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { goToProduct } = useShopNavigation()
  const { format } = useCurrency()

  const activeColor = selectedColor != null ? product.colors[selectedColor] : null
  const displayImage = activeColor?.thumbnail || product.image
  const hoverImage = product.secondaryImage || product.image
  const showHoverSwap =
    isHovered && selectedColor == null && hoverImage !== displayImage

  const open = () => {
    trackSelectItem({
      item_list_id: listId,
      item_list_name: listName,
      item: {
        item_id: product.id,
        item_name: product.name,
        item_category: product.collection,
        item_variant:
          activeColor && activeColor.name !== 'Default' ? activeColor.name : undefined,
        price: product.price,
      },
    })
    setPendingProductColor(activeColor?.name !== 'Default' ? activeColor?.name : null)
    goToProduct({ id: product.id, slug: product.slug })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`snap-start ${productCardWidthClass} cursor-pointer`}
      onClick={open}
    >
      <div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${productImageContainerClass} rounded-sm`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={displayImage}
            src={displayImage}
            alt={`${product.name}${activeColor ? ` — ${activeColor.name}` : ''}`}
            className={`w-full h-full ${productImageFitClass} transition-opacity duration-300 ${
              showHoverSwap ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {selectedColor == null && (
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
              Trending
            </span>
          </div>

          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {product.discountPercent > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide text-white bg-rose-600 rounded-sm leading-tight">
                Save {product.discountPercent}%
              </span>
            )}
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
              color={activeColor && activeColor.name !== 'Default' ? activeColor.name : null}
              colorSwatch={activeColor?.swatch}
            />
          </div>
        </div>

        <div className="pt-3 pb-1">
          <div className="flex flex-col items-center gap-1.5">
            <h3 className="text-sm font-semibold text-slate-900 text-center line-clamp-2 leading-tight px-1">
              {product.name}
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-rose-600">{format(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {format(product.originalPrice)}
                </span>
              )}
            </div>

            <ColorSwatches
              colors={product.colors}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function FeaturedCollections({
  showBags = true,
  showShoes = true,
}: {
  showBags?: boolean
  showShoes?: boolean
}) {
  const availableTabs = useMemo(
    () =>
      tabs.filter((tab) => (tab.value === 'bags' ? showBags : showShoes)),
    [showBags, showShoes]
  )
  const [activeTab, setActiveTab] = useState<CollectionTab>(
    () => availableTabs[0]?.value ?? 'bags'
  )
  const [products, setProducts] = useState<PrimeCardProduct[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const trackedList = useRef<string | null>(null)
  const { goToShop } = useShopNavigation()

  useEffect(() => {
    if (availableTabs.length === 0) return
    if (!availableTabs.some((t) => t.value === activeTab)) {
      setActiveTab(availableTabs[0].value)
    }
  }, [availableTabs, activeTab])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        const mapped = list
          .map((p: ApiProduct) => mapApiToCard(p))
          .filter((p: PrimeCardProduct | null): p is PrimeCardProduct => Boolean(p))
        setProducts(mapped)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(
    () => products.filter((p) => p.collection === activeTab),
    [products, activeTab]
  )

  const listId = `prime_${activeTab}`
  const listName = activeTab === 'bags' ? 'Prime Bags' : 'Prime Shoes'

  useEffect(() => {
    if (filteredProducts.length === 0) return
    const key = `${listId}:${filteredProducts.map((p) => p.id).join(',')}`
    if (trackedList.current === key) return
    trackedList.current = key
    trackViewItemList({
      item_list_id: listId,
      item_list_name: listName,
      items: filteredProducts.slice(0, 12).map((p) => ({
        item_id: p.id,
        item_name: p.name,
        item_category: p.collection,
        price: p.price,
      })),
    })
  }, [filteredProducts, listId, listName])

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

  if (availableTabs.length === 0) return null

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 mb-10 sm:mb-12">
          {availableTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
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

        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-slate-500 py-12 text-sm">
            No {listName.toLowerCase()} yet. Mark products with Collection → {listName} in Admin.
          </p>
        ) : (
          <div className="relative group/carousel">
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  type="button"
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
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      listId={listId}
                      listName={listName}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  type="button"
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
            type="button"
            variant="outline"
            className="px-10 py-2.5 text-sm font-semibold tracking-widest uppercase border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 rounded-sm"
            onClick={() => goToShop({ category: 'all', collection: activeTab })}
          >
            View all
          </Button>
        </div>
      </div>
    </section>
  )
}
