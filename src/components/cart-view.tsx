'use client'

import { useStore } from '@/lib/store'
import { useCurrency } from '@/hooks/use-currency'
import { useStoreCommerce } from '@/hooks/use-store-commerce'
import { productThumbClass } from '@/lib/product-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { FreeDeliveryProgress } from '@/components/free-delivery-progress'
import { QuantityInput } from '@/components/quantity-input'

export function CartView() {
  const { cart, updateQuantity, removeFromCart, cartTotal, setView } = useStore()
  const { format } = useCurrency()
  const { freeDeliveryMin, getShipping } = useStoreCommerce()

  const subtotal = cartTotal()
  const shipping = getShipping(subtotal)
  const total = subtotal + shipping

  if (cart.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-white min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-6">Add some products to get started!</p>
          <Button
            onClick={() => setView('shop')}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            Browse Products
          </Button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 bg-slate-50 min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('shop')}
          className="mb-6 text-slate-500 hover:text-amber-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </Button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={`${item.productId}-${item.color || 'default'}-${item.size || 'os'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="rounded-xl border-slate-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      <div className={`${productThumbClass} w-20 sm:w-24 rounded-lg`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 h-full w-full object-fill"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                        {(item.color && item.color !== 'Default') || item.size ? (
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            {item.color && item.color !== 'Default' && (
                              <span className="inline-flex items-center gap-1.5">
                                {item.colorSwatch && (
                                  <span
                                    className="inline-block h-3 w-3 rounded-full border border-slate-200"
                                    style={{ backgroundColor: item.colorSwatch }}
                                  />
                                )}
                                Color: {item.color}
                              </span>
                            )}
                            {item.size ? (
                              <span>
                                {item.color && item.color !== 'Default' ? '· ' : ''}
                                Size: {item.size}
                              </span>
                            ) : null}
                          </p>
                        ) : null}
                        <p className="text-lg font-bold text-amber-700 mt-1">
                          {format(item.price)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <QuantityInput
                            value={item.quantity}
                            size="sm"
                            className="rounded-lg"
                            onChange={(next) =>
                              updateQuantity(
                                item.productId,
                                next,
                                item.color,
                                item.size
                              )
                            }
                          />
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-700">
                              {format(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() =>
                                removeFromCart(item.productId, item.color, item.size)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="rounded-xl border-slate-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                <FreeDeliveryProgress
                  subtotal={subtotal}
                  freeDeliveryMin={freeDeliveryMin}
                  className="mb-5"
                />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="font-medium text-slate-700">{format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium text-slate-700">
                      {shipping === 0 ? 'Free' : format(shipping)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-amber-700">{format(total)}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-500/25"
                  onClick={() => setView('checkout')}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
