'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Search, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { categorySubCategories, subCategoryMap } from '@/lib/categories'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  rating: number
  badge: string | null
  inStock: boolean
}

const badgeColors: Record<string, string> = {
  'Best Seller': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'New': 'bg-teal-100 text-teal-700 border-teal-200',
  'Premium': 'bg-amber-100 text-amber-700 border-amber-200',
  'Popular': 'bg-rose-100 text-rose-700 border-rose-200',
  'Innovative': 'bg-violet-100 text-violet-700 border-violet-200',
  'SaaS': 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

const categoryTabs = [
  { value: 'all', label: 'All' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'predictive', label: 'Predictive' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'robotic', label: 'Robotic' },
  { value: 'analytics', label: 'Analytics' },
]

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'name'

export function ProductGrid() {
  const { setView, selectProduct, addToCart, categoryFilter, setCategoryFilter, searchQuery, setSearchQuery } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [subCategoryFilter, setSubCategoryFilter] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error)
  }, [])

  // Wrap setCategoryFilter to also reset sub-category
  const handleCategoryChange = useCallback((category: string) => {
    setCategoryFilter(category)
    setSubCategoryFilter(null)
  }, [setCategoryFilter])

  // Get sub-categories for the current main category
  const currentSubCategories = useMemo(() => {
    if (categoryFilter === 'all' || !categorySubCategories[categoryFilter]) {
      return []
    }
    return categorySubCategories[categoryFilter]
  }, [categoryFilter])

  const filteredProducts = useMemo(() => {
    let result = products

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter)
    }

    // Sub-category filter: match product name to subCategoryMap
    if (subCategoryFilter) {
      result = result.filter((p) => subCategoryMap[p.name] === subCategoryFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [products, categoryFilter, subCategoryFilter, searchQuery, sortBy])

  return (
    <section className="py-8 sm:py-12 bg-white min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Product Catalog</h1>
          <p className="mt-1 text-slate-500">{filteredProducts.length} products available</p>
        </div>

        {/* Filters */}
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
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categoryTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={categoryFilter === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(tab.value)}
              className={`rounded-lg ${
                categoryFilter === tab.value
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-200'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Sub-category filters (shown when a main category is selected) */}
        {currentSubCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-6 pl-1"
          >
            <Button
              variant={subCategoryFilter === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSubCategoryFilter(null)}
              className={`rounded-full text-xs h-8 ${
                subCategoryFilter === null
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-teal-600'
              }`}
            >
              All
            </Button>
            {currentSubCategories.map((sub) => (
              <Button
                key={sub.value}
                variant={subCategoryFilter === sub.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSubCategoryFilter(sub.value)}
                className={`rounded-full text-xs h-8 ${
                  subCategoryFilter === sub.value
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-teal-600'
                }`}
              >
                {sub.label}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Product grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                handleCategoryChange('all')
                setSearchQuery('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card className="group overflow-hidden rounded-xl border-slate-200 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <div
                    className="relative aspect-square overflow-hidden bg-slate-100"
                    onClick={() => {
                      selectProduct(product.id)
                      setView('product')
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.badge && (
                      <Badge
                        className={`absolute top-3 left-3 ${badgeColors[product.badge] || 'bg-slate-100 text-slate-700'}`}
                      >
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-semibold text-slate-900 line-clamp-1 cursor-pointer hover:text-teal-600 transition-colors"
                      onClick={() => {
                        selectProduct(product.id)
                        setView('product')
                      }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 capitalize">{product.category}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <span className="text-lg font-bold text-teal-600">
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
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
