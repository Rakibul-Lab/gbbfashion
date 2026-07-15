'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryHero } from '@/components/category-hero'
import { useSectionMedia } from '@/hooks/use-section-media'
import { SHOP_HERO_MEDIA_KEYS } from '@/lib/section-media'
import { OptimizedImage } from '@/components/optimized-image'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  categorySubCategories,
  subCategoryMap,
  getShopPageConfig,
  getSubCategoryLabel,
  navCategories,
} from '@/lib/categories'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { productImageContainerClass } from '@/lib/product-image'
import { AddToCartPlus } from '@/components/add-to-cart-plus'
import { ProductColorSwatches } from '@/components/product-color-swatches'
import {
  resolveProductColorVariants,
  type ProductColorVariant,
} from '@/lib/product-colors'
import { useCurrency } from '@/hooks/use-currency'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  category: string
  image: string
  secondaryImage?: string | null
  galleryImages?: string | null
  colors?: string | null
  badge: string | null
  inStock: boolean
  hasFlash?: boolean
  subCategory?: string | null
  isNewArrival?: boolean
  isPrimeDrop?: boolean
  isFeatured?: boolean
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  New: 'bg-teal-100 text-teal-700 border-teal-200',
  Premium: 'bg-amber-100 text-amber-700 border-amber-200',
  Popular: 'bg-rose-100 text-rose-700 border-rose-200',
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name'

function ShopProductCard({
  product,
  index,
  onOpen,
}: {
  product: Product
  index: number
  onOpen: () => void
}) {
  const { format } = useCurrency()
  const variants = useMemo(() => resolveProductColorVariants(product), [product])
  const [selected, setSelected] = useState<ProductColorVariant | null>(null)
  const active = selected || variants[0]
  const displayImage = active?.image || product.image

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      layout
      className="min-w-0"
    >
      <Card className="group overflow-hidden rounded-xl border-slate-200 p-0 gap-0 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className={`${productImageContainerClass} rounded-none`} onClick={onOpen}>
          <OptimizedImage
            src={displayImage}
            alt={product.name}
            fill
            fit="fill"
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <Badge
              className={`absolute top-2 left-2 text-[10px] uppercase tracking-wider ${
                badgeColors[product.badge] || 'bg-slate-900 text-white border-0'
              }`}
            >
              {product.badge}
            </Badge>
          )}
          <div
            className="absolute bottom-2 right-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
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
        <CardContent className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
          <h3
            className="font-medium text-sm sm:text-base text-slate-900 line-clamp-2 cursor-pointer hover:text-amber-800 transition-colors leading-snug"
            onClick={onOpen}
          >
            {product.name}
          </h3>
          {variants.length > 0 && (
            <ProductColorSwatches
              variants={variants}
              selectedName={active?.name || ''}
              onSelect={setSelected}
              size="sm"
              stopPropagation
            />
          )}
          <div className="mt-auto pt-1">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {format(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-xs text-slate-400 line-through">
                {format(product.originalPrice)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ProductGrid() {
  const {
    categoryFilter,
    subCategoryFilter,
    shopMode,
    setSubCategoryFilter,
    searchQuery,
    setSearchQuery,
  } = useStore()
  const { goToShop, goToProduct } = useShopNavigation()
  const { format } = useCurrency()
  const { get } = useSectionMedia()
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [priceMax, setPriceMax] = useState<number>(500)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const shouldFilterServer = shopMode === 'category' && categoryFilter !== 'all'
    const url = shouldFilterServer
      ? `/api/products?category=${encodeURIComponent(categoryFilter)}`
      : '/api/products'

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return
        setProducts(data)
        const maxPrice = Math.max(...data.map((p: Product) => p.price), 200)
        setPriceMax(Math.ceil(maxPrice / 10) * 10)
      })
      .catch(console.error)
  }, [shopMode, categoryFilter])

  const pageConfig = useMemo(
    () => getShopPageConfig(shopMode, categoryFilter, subCategoryFilter),
    [shopMode, categoryFilter, subCategoryFilter]
  )

  const shopHeroMedia = useMemo(() => {
    const modeKey =
      shopMode === 'new-arrivals' || shopMode === 'prime-drop'
        ? shopMode
        : categoryFilter
    const keys = SHOP_HERO_MEDIA_KEYS[modeKey]
    if (!keys) return { left: undefined, right: undefined }
    return { left: get(keys.left), right: get(keys.right) }
  }, [shopMode, categoryFilter, get])

  const currentSubCategories = useMemo(() => {
    if (shopMode !== 'category' || categoryFilter === 'all') return []
    return categorySubCategories[categoryFilter] ?? []
  }, [shopMode, categoryFilter])

  const activeCategoryLabel = useMemo(() => {
    return navCategories.find((c) => c.value === categoryFilter)?.label ?? categoryFilter
  }, [categoryFilter])

  const handleSubCategoryChange = useCallback(
    (sub: string | null) => {
      setSubCategoryFilter(sub)
      if (shopMode === 'category' && categoryFilter !== 'all') {
        goToShop({ category: categoryFilter, subCategory: sub })
      }
    },
    [setSubCategoryFilter, shopMode, categoryFilter, goToShop]
  )

  const filteredProducts = useMemo(() => {
    let result = products

    if (shopMode === 'new-arrivals') {
      // Menu New Arrivals — only products flagged in admin
      result = result.filter((p) => p.isNewArrival === true)
    } else if (shopMode === 'prime-drop') {
      // Menu Prime Drop — only products flagged in admin
      result = result.filter((p) => p.isPrimeDrop === true)
    } else if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter)
    }

    if (subCategoryFilter) {
      result = result.filter(
        (p) =>
          p.subCategory === subCategoryFilter ||
          subCategoryMap[p.name] === subCategoryFilter
      )
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    result = result.filter((p) => p.price <= priceMax)

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [products, shopMode, categoryFilter, subCategoryFilter, searchQuery, sortBy, priceMax])

  const showCategoryHero = shopMode !== 'browse'

  return (
    <div className="bg-white min-h-[60vh]">
      {showCategoryHero && (
        <CategoryHero
          config={pageConfig}
          leftMedia={shopHeroMedia.left}
          rightMedia={shopHeroMedia.right}
        />
      )}

      {/* Subcategory quick links */}
      {currentSubCategories.length > 0 && (
        <div className="border-b border-stone-200/80 bg-[#FAF7F2]">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-stone-500 uppercase mr-2">
                Shop:
              </span>
              <button
                onClick={() => handleSubCategoryChange(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !subCategoryFilter
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                }`}
              >
                All {activeCategoryLabel}
              </button>
              {currentSubCategories.map((sub) => (
                <button
                  key={sub.value}
                  onClick={() => handleSubCategoryChange(sub.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    subCategoryFilter === sub.value
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-lg border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 min-w-0 sm:flex-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white"
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-6">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            {subCategoryFilter && shopMode === 'category'
              ? ` in ${getSubCategoryLabel(categoryFilter, subCategoryFilter)}`
              : shopMode === 'category' && categoryFilter !== 'all'
                ? ` in ${activeCategoryLabel}`
                : ''}
          </p>

          <div className="flex gap-8">
            {/* Desktop sidebar filters */}
            <aside className="hidden lg:block w-56 shrink-0 space-y-6">
              {shopMode === 'browse' && (
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                    Categories
                  </h3>
                  <ul className="space-y-1">
                    {navCategories.map((cat) => (
                      <li key={cat.value}>
                        <button
                          onClick={() => goToShop({ category: cat.value })}
                          className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                            cat.highlight
                              ? 'text-rose-600 hover:text-rose-700 font-semibold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentSubCategories.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                    Subcategory
                  </h3>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => handleSubCategoryChange(null)}
                        className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                          !subCategoryFilter
                            ? 'bg-stone-900 text-white font-medium'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        All {activeCategoryLabel}
                      </button>
                    </li>
                    {currentSubCategories.map((sub) => (
                      <li key={sub.value}>
                        <button
                          onClick={() => handleSubCategoryChange(sub.value)}
                          className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                            subCategoryFilter === sub.value
                              ? 'bg-stone-900 text-white font-medium'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                  Price
                </h3>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-stone-800"
                />
                <p className="text-sm text-slate-500 mt-1">Up to {format(priceMax)}</p>
              </div>

              {shopMode === 'category' && (
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                    Shop More
                  </h3>
                  <ul className="space-y-1">
                    {navCategories
                      .filter((c) => c.value !== categoryFilter)
                      .map((cat) => (
                        <li key={cat.value}>
                          <button
                            onClick={() => goToShop({ category: cat.value })}
                            className="w-full text-left text-sm py-1.5 px-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            {cat.label}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* Mobile filters sheet */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetContent side="left" className="w-[min(20rem,100vw)] p-0">
                <SheetHeader className="p-5 border-b border-slate-100">
                  <SheetTitle className="text-left text-base tracking-widest uppercase">
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <div className="p-5 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
                  {shopMode === 'browse' && (
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                        Categories
                      </h3>
                      <ul className="space-y-1">
                        {navCategories.map((cat) => (
                          <li key={cat.value}>
                            <button
                              onClick={() => {
                                goToShop({ category: cat.value })
                                setSidebarOpen(false)
                              }}
                              className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                                cat.highlight
                                  ? 'text-rose-600 hover:text-rose-700 font-semibold'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {cat.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentSubCategories.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                        Subcategory
                      </h3>
                      <ul className="space-y-1">
                        <li>
                          <button
                            onClick={() => {
                              handleSubCategoryChange(null)
                              setSidebarOpen(false)
                            }}
                            className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                              !subCategoryFilter
                                ? 'bg-stone-900 text-white font-medium'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            All {activeCategoryLabel}
                          </button>
                        </li>
                        {currentSubCategories.map((sub) => (
                          <li key={sub.value}>
                            <button
                              onClick={() => {
                                handleSubCategoryChange(sub.value)
                                setSidebarOpen(false)
                              }}
                              className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                                subCategoryFilter === sub.value
                                  ? 'bg-stone-900 text-white font-medium'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {sub.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                      Price
                    </h3>
                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={10}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-stone-800"
                    />
                    <p className="text-sm text-slate-500 mt-1">Up to {format(priceMax)}</p>
                  </div>

                  {shopMode === 'category' && (
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-slate-900 uppercase mb-3">
                        Shop More
                      </h3>
                      <ul className="space-y-1">
                        {navCategories
                          .filter((c) => c.value !== categoryFilter)
                          .map((cat) => (
                            <li key={cat.value}>
                              <button
                                onClick={() => {
                                  goToShop({ category: cat.value })
                                  setSidebarOpen(false)
                                }}
                                className="w-full text-left text-sm py-1.5 px-2 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                              >
                                {cat.label}
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('')
                      setSubCategoryFilter(null)
                      goToShop({ category: 'all', shopMode: 'browse' })
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {filteredProducts.map((product, index) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      onOpen={() => goToProduct(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
