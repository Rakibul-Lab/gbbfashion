'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Star, ShoppingCart } from 'lucide-react'
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
  'Innovative': 'bg-violet-100 text-violet-700 border-violet-200',
  'SaaS': 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

export function FeaturedProducts() {
  const { setView, selectProduct, addToCart } = useStore()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.slice(0, 4)))
      .catch(console.error)
  }, [])

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-slate-900"
          >
            Featured Products
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Discover our most popular AI-powered maintenance solutions trusted by industry leaders
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden rounded-xl border-slate-200 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 cursor-pointer h-full">
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
                <CardContent className="p-4">
                  <h3
                    className="font-semibold text-slate-900 line-clamp-1 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => {
                      selectProduct(product.id)
                      setView('product')
                    }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
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

        <div className="text-center mt-10">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setView('shop')}
            className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
