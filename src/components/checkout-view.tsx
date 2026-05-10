'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function CheckoutView() {
  const { cart, cartTotal, setView, setOrderId, clearCart } = useStore()
  const [loading, setLoading] = useState(false)

  const subtotal = cartTotal()
  const shipping = subtotal > 5000 ? 0 : 49.99
  const total = subtotal + shipping

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.customerName.trim()) errs.customerName = 'Name is required'
    if (!form.customerEmail.trim()) errs.customerEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) errs.customerEmail = 'Invalid email'
    if (!form.customerPhone.trim()) errs.customerPhone = 'Phone is required'
    if (!form.shippingAddress.trim()) errs.shippingAddress = 'Address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state.trim()) errs.state = 'State is required'
    if (!form.zipCode.trim()) errs.zipCode = 'ZIP code is required'
    else if (!/^\d{5}(-\d{4})?$/.test(form.zipCode)) errs.zipCode = 'Invalid ZIP code'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          totalAmount: total,
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      })

      if (!res.ok) throw new Error('Failed to create order')

      const order = await res.json()
      setOrderId(order.id)
      clearCart()
      setView('confirmation')
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <section className="py-8 sm:py-12 bg-slate-50 min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('cart')}
          className="mb-6 text-slate-500 hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="rounded-xl border-slate-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={form.customerName}
                      onChange={(e) => updateField('customerName', e.target.value)}
                      className={errors.customerName ? 'border-red-400' : ''}
                    />
                    {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.customerEmail}
                      onChange={(e) => updateField('customerEmail', e.target.value)}
                      className={errors.customerEmail ? 'border-red-400' : ''}
                    />
                    {errors.customerEmail && <p className="text-xs text-red-500">{errors.customerEmail}</p>}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={form.customerPhone}
                      onChange={(e) => updateField('customerPhone', e.target.value)}
                      className={errors.customerPhone ? 'border-red-400' : ''}
                    />
                    {errors.customerPhone && <p className="text-xs text-red-500">{errors.customerPhone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={form.shippingAddress}
                      onChange={(e) => updateField('shippingAddress', e.target.value)}
                      className={errors.shippingAddress ? 'border-red-400' : ''}
                    />
                    {errors.shippingAddress && <p className="text-xs text-red-500">{errors.shippingAddress}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className={errors.city ? 'border-red-400' : ''}
                    />
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className={errors.state ? 'border-red-400' : ''}
                    />
                    {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      placeholder="94105"
                      value={form.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      className={errors.zipCode ? 'border-red-400' : ''}
                    />
                    {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-xl border-slate-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-teal-600">${total.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full mt-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-teal-500/25"
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order — $${total.toLocaleString()}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
