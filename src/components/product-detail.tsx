'use client'

import { useStore } from '@/lib/store'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useCurrency } from '@/hooks/use-currency'
import { OptimizedImage } from '@/components/optimized-image'
import { productImageContainerClass } from '@/lib/product-image'
import { AddToCartPlus } from '@/components/add-to-cart-plus'
import { QuantityInput } from '@/components/quantity-input'
import { ProductColorSwatches } from '@/components/product-color-swatches'
import {
  resolveProductColorVariants,
  resolveProductGallery,
  type ProductColorVariant,
} from '@/lib/product-colors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Check, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { trackViewItem } from '@/lib/gtm'

interface Product {
  id: string
  name: string
  slug?: string | null
  description: string
  price: number
  originalPrice?: number | null
  category: string
  image: string
  secondaryImage?: string | null
  galleryImages?: string | null
  colors?: string | null
  features?: string | null
  badge: string | null
  stock?: number
  inStock: boolean
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  New: 'bg-teal-100 text-teal-700 border-teal-200',
  Premium: 'bg-amber-100 text-amber-700 border-amber-200',
  Popular: 'bg-rose-100 text-rose-700 border-rose-200',
}

export function ProductDetail() {
  const { selectedProductId, setView, addToCart } = useStore()
  const { goToShop, goToProduct } = useShopNavigation()
  const { format } = useCurrency()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedColor, setSelectedColor] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const lastViewedId = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedProductId) {
      setLoading(false)
      setNotFound(true)
      return
    }

    setLoading(true)
    setNotFound(false)
    setProduct(null)

    fetch(`/api/products/${selectedProductId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error || !data.id) {
          setProduct(null)
          setNotFound(true)
          return
        }
        setProduct(data)
        setQuantity(1)
        const variants = resolveProductColorVariants(data)
        const first = variants[0]
        setSelectedColor(first?.name || '')
        setActiveImage(first?.image || data.image)
        if (lastViewedId.current !== data.id) {
          lastViewedId.current = data.id
          trackViewItem({
            item_id: data.id,
            item_name: data.name,
            item_category: data.category,
            price: data.price,
          })
        }
        if (data.category) {
          fetch(`/api/products?category=${data.category}`)
            .then((r) => r.json())
            .then((items) =>
              setRelated(
                Array.isArray(items)
                  ? items.filter((i: Product) => i.id !== data.id).slice(0, 4)
                  : []
              )
            )
            .catch(console.error)
        }
      })
      .catch(() => {
        setNotFound(true)
        setProduct(null)
      })
      .finally(() => setLoading(false))
  }, [selectedProductId])

  const colorVariants = useMemo(
    () => (product ? resolveProductColorVariants(product) : []),
    [product]
  )

  const gallery = useMemo(
    () => (product ? resolveProductGallery(product, selectedColor) : []),
    [product, selectedColor]
  )

  const activeVariant = useMemo(
    () =>
      colorVariants.find(
        (v) => v.name.toLowerCase() === selectedColor.toLowerCase()
      ) || colorVariants[0],
    [colorVariants, selectedColor]
  )

  const selectColor = (variant: ProductColorVariant) => {
    setSelectedColor(variant.name)
    if (variant.image) setActiveImage(variant.image)
  }

  const selectThumb = (src: string) => {
    setActiveImage(src)
    const matched = colorVariants.find((v) => v.image === src)
    if (matched) setSelectedColor(matched.name)
  }

  const activeIndex = Math.max(0, gallery.indexOf(activeImage))

  const stepGallery = (dir: -1 | 1) => {
    if (gallery.length < 2) return
    const next = (activeIndex + dir + gallery.length) % gallery.length
    selectThumb(gallery[next])
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-200 border-t-amber-600 rounded-full" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-medium text-slate-900">Product not found</p>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          This item may have been removed or is unavailable.
        </p>
        <Button
          onClick={() => goToShop({ category: 'all', shopMode: 'browse' })}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          Browse Products
        </Button>
      </div>
    )
  }

  const features = (product.features ?? '')
    .split('|')
    .map((f) => f.trim())
    .filter(Boolean)

  const displayImage = activeImage || product.image
  const hasDiscount =
    !!product.originalPrice && product.originalPrice > product.price

  const lineTotal = product.price * quantity
  const compareTotal =
    hasDiscount && product.originalPrice
      ? product.originalPrice * quantity
      : null

  const addCurrentProductToCart = () => {
    const color = activeVariant?.name || selectedColor || null
    const image = displayImage
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image,
        color,
        colorSwatch: activeVariant?.swatch || null,
      },
      quantity
    )

    return color && color !== 'Default' ? `${product.name} (${color})` : product.name
  }

  const handleAddToCart = () => {
    const label = addCurrentProductToCart()
    toast.success(`${quantity}× ${label} added to cart`, {
      action: {
        label: 'View Cart',
        onClick: () => setView('cart'),
      },
    })
  }

  const handleBuyNow = () => {
    addCurrentProductToCart()
    setView('checkout')
  }

  return (
    <section className="py-8 sm:py-12 bg-white min-h-[60vh]">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToShop({ category: product.category })}
          className="mb-6 text-slate-500 hover:text-amber-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className={`relative ${productImageContainerClass} rounded-2xl shadow-lg group`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayImage}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <OptimizedImage
                    src={displayImage}
                    alt={`${product.name}${selectedColor ? ` — ${selectedColor}` : ''}`}
                    fill
                    fit="fill"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="rounded-2xl"
                  />
                </motion.div>
              </AnimatePresence>

              {product.badge && (
                <Badge
                  className={`absolute top-4 left-4 z-10 text-sm ${
                    badgeColors[product.badge] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {product.badge}
                </Badge>
              )}

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => stepGallery(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => stepGallery(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 border border-slate-200 shadow-md flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {gallery.map((src, index) => {
                  const isActive = src === displayImage
                  const colorForThumb = colorVariants.find((v) => v.image === src)
                  return (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      onClick={() => selectThumb(src)}
                      className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        isActive
                          ? 'border-slate-900 ring-1 ring-slate-900/20'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                      title={colorForThumb?.name || `Image ${index + 1}`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {colorForThumb && (
                        <span
                          className="absolute bottom-1 right-1 h-3 w-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: colorForThumb.swatch }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="mb-2">
              <span className="text-sm font-medium text-amber-700 uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </p>

            <div className="mt-4 space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                  {format(lineTotal)}
                </span>
                {compareTotal !== null && (
                  <span className="text-lg text-slate-400 line-through tabular-nums">
                    {format(compareTotal)}
                  </span>
                )}
              </div>
              {quantity > 1 && (
                <p className="text-sm text-slate-500">
                  {format(product.price)} each × {quantity}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <ProductColorSwatches
                variants={colorVariants}
                selectedName={selectedColor || colorVariants[0]?.name || ''}
                onSelect={selectColor}
                size="lg"
                showLabel
              />
              {colorVariants.length > 1 && (
                <p className="text-xs text-slate-400">
                  {colorVariants.length} colors available — select a swatch to preview
                </p>
              )}
            </div>

            <Separator className="my-6" />

            <p className="text-slate-600 leading-relaxed">{product.description}</p>

            {features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Key Features
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-amber-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="my-6" />

            <div className="flex flex-row items-stretch gap-2 sm:gap-3">
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                max={
                  typeof product.stock === 'number' && product.stock > 0
                    ? product.stock
                    : product.inStock
                      ? 999
                      : 1
                }
                className="shrink-0"
              />
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 min-w-0 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-500/25 px-2 sm:px-4"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 shrink-0" />
                <span className="truncate text-sm sm:text-base">Add to Cart</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 min-w-0 h-11 rounded-xl border-2 border-rose-600 bg-white text-rose-700 hover:bg-rose-600 hover:text-white px-2 sm:px-4"
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 shrink-0" />
                <span className="truncate text-sm sm:text-base">Buy Now</span>
              </Button>
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {related.map((p) => {
                const relatedColors = resolveProductColorVariants(p)
                return (
                  <Card
                    key={p.id}
                    className="group overflow-hidden rounded-xl border-slate-200 p-0 gap-0 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
                    onClick={() => goToProduct({ id: p.id, slug: p.slug })}
                  >
                    <div className={`${productImageContainerClass} rounded-none`}>
                      <OptimizedImage
                        src={p.image}
                        alt={p.name}
                        fill
                        fit="fill"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <div
                        className="absolute bottom-2 right-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AddToCartPlus
                          productId={p.id}
                          name={p.name}
                          price={p.price}
                          image={p.image}
                          color={relatedColors[0]?.name}
                          colorSwatch={relatedColors[0]?.swatch}
                          size="sm"
                        />
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
                      <h3 className="font-medium text-sm sm:text-base text-slate-900 line-clamp-2">
                        {p.name}
                      </h3>
                      {relatedColors.length > 0 && (
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {relatedColors.slice(0, 5).map((c) => (
                            <span
                              key={c.name}
                              title={c.name}
                              className="h-3.5 w-3.5 rounded-full border border-slate-200"
                              style={{ backgroundColor: c.swatch }}
                            />
                          ))}
                          {relatedColors.length > 5 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{relatedColors.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm sm:text-base font-bold text-slate-900 mt-auto">
                        {format(p.price)}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
