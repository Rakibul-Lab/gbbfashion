'use client'

import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Minus, Plus, ArrowLeft, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  features: string
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

export function ProductDetail() {
  const { selectedProductId, setView, selectProduct, addToCart } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (selectedProductId) {
      fetch(`/api/products/${selectedProductId}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data)
          setQuantity(1)
          // Fetch related products
          fetch(`/api/products?category=${data.category}`)
            .then((r) => r.json())
            .then((items) => setRelated(items.filter((i: Product) => i.id !== data.id).slice(0, 4)))
            .catch(console.error)
        })
        .catch(console.error)
    }
  }, [selectedProductId])

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal-200 border-t-teal-600 rounded-full" />
      </div>
    )
  }

  const features = product.features.split('|')

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    // Update quantity for additional items beyond the first
    const { cart } = useStore.getState()
    const existing = cart.find((c) => c.productId === product.id)
    if (existing && quantity > 1) {
      useStore.getState().updateQuantity(product.id, existing.quantity + quantity - 1)
    } else if (!existing && quantity > 1) {
      // For new items with quantity > 1, set the correct quantity
      useStore.getState().updateQuantity(product.id, quantity)
    }
    toast.success(`${quantity}x ${product.name} added to cart`, {
      action: {
        label: 'View Cart',
        onClick: () => setView('cart'),
      },
    })
  }

  return (
    <section className="py-8 sm:py-12 bg-white min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('shop')}
          className="mb-6 text-slate-500 hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.badge && (
              <Badge
                className={`absolute top-4 left-4 text-sm ${badgeColors[product.badge] || 'bg-slate-100 text-slate-700'}`}
              >
                {product.badge}
              </Badge>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="mb-2">
              <span className="text-sm font-medium text-teal-600 uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">{product.rating}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-500">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div className="mt-4">
              <span className="text-3xl font-bold text-teal-600">
                ${product.price.toLocaleString()}
              </span>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <p className="text-slate-600 leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Key Features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-teal-500 shrink-0" />
                    {feature.trim()}
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            {/* Add to cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 rounded-r-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 rounded-l-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-teal-500/25"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart — ${(product.price * quantity).toLocaleString()}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <Card
                  key={p.id}
                  className="group overflow-hidden rounded-xl border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => selectProduct(p.id)}
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-slate-900 line-clamp-1">{p.name}</h3>
                    <p className="text-sm font-bold text-teal-600 mt-1">${p.price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
