'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'

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

const featuredProductNames = [
  'GBB Exclusive Cow Leather Tote Handbag',
  'Premium Leather Backpack - Dark Brown',
  'Elegant Crossbody Bag with Gold Chain',
  'Oxford Dress Shoes - Dark Brown',
  'Luxury Shoulder Bag - Burgundy',
]

export function StoriesSection() {
  const { setView, selectProduct, addToCart } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const featured = featuredProductNames
          .map((name) => data.find((p: Product) => p.name === name))
          .filter(Boolean) as Product[]
        setProducts(featured)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-amber-200 border-t-amber-600 rounded-full" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Jost, sans-serif' }}>Featured Picks</h2>
          <p className="mt-2 text-slate-500 text-sm">Handpicked selections from our latest collection.</p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="group"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer"
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

                <div className="p-3">
                  <h3
                    className="font-medium text-xs sm:text-sm text-slate-900 line-clamp-1 cursor-pointer hover:text-amber-700 transition-colors"
                    onClick={() => {
                      selectProduct(product.id)
                      setView('product')
                    }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-amber-700 mt-1">
                    ${product.price.toLocaleString()}
                  </p>
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
                    className="w-full mt-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-8 text-xs"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
