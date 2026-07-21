'use client'

import { useStore } from '@/lib/store'
import { useCurrency } from '@/hooks/use-currency'
import { useStoreCommerce } from '@/hooks/use-store-commerce'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Banknote,
  Loader2,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { productThumbClass } from '@/lib/product-image'
import { PAYMENT_METHODS } from '@/lib/payment'
import { isValidBdMobile } from '@/lib/phone'
import { FreeDeliveryProgress } from '@/components/free-delivery-progress'
import { cartItemsToGtm, trackBeginCheckout } from '@/lib/gtm'

interface CheckoutProfile {
  name: string
  email: string
  phone: string | null
  shippingAddress: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

type CheckoutForm = {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  city: string
  state: string
  zipCode: string
}

const emptyForm: CheckoutForm = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  city: '',
  state: '',
  zipCode: '',
}

export function CheckoutView() {
  const { cart, cartTotal, setView, setOrderId, clearCart, user, setUser, setAccountTab } =
    useStore()
  const { format } = useCurrency()
  const { freeDeliveryMin, getShipping } = useStoreCommerce()
  const [loading, setLoading] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const paymentMethod = PAYMENT_METHODS.COD

  const subtotal = cartTotal()
  const shipping = getShipping(subtotal)
  const total = subtotal + shipping

  const [form, setForm] = useState<CheckoutForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (cart.length === 0) return
    trackBeginCheckout(cartItemsToGtm(cart), subtotal)
    // Only on first mount / entering checkout — not on every cart/price recalculation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    if (!payment) return

    if (payment === 'failed') {
      toast.error('Online payment failed. Your cart is saved — try again or choose Cash on Delivery.')
    } else if (payment === 'cancelled') {
      toast.message('Payment cancelled. You can complete the order anytime.')
    }

    params.delete('payment')
    params.delete('order')
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
    window.history.replaceState(window.history.state, '', next)
  }, [])

  useEffect(() => {
    if (!user) {
      setProfileLoaded(true)
      return
    }
    if (profileLoaded) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/account/me', { cache: 'no-store' })
        const me = res.ok ? ((await res.json()) as CheckoutProfile) : null
        if (cancelled) return

        setForm({
          customerName: (me?.name || user.name || '').trim(),
          customerEmail: (me?.email || user.email || '').trim(),
          customerPhone: (me?.phone || '').trim(),
          shippingAddress: (me?.shippingAddress || '').trim(),
          city: (me?.city || '').trim(),
          state: (me?.state || '').trim(),
          zipCode: (me?.zipCode || '').trim(),
        })
        setProfileLoaded(true)
      } catch {
        if (cancelled) return
        setForm({
          ...emptyForm,
          customerName: (user.name || '').trim(),
          customerEmail: (user.email || '').trim(),
        })
        setProfileLoaded(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user, profileLoaded])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.customerName.trim()) errs.customerName = 'Name is required'
    if (form.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      errs.customerEmail = 'Invalid email'
    }
    if (!form.customerPhone.trim()) errs.customerPhone = 'Phone is required'
    else if (!isValidBdMobile(form.customerPhone)) {
      errs.customerPhone = 'Enter a valid mobile (01XXXXXXXXX or +8801XXXXXXXXX)'
    }
    if (!form.shippingAddress.trim()) errs.shippingAddress = 'Address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state.trim()) errs.state = 'State is required'
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
          paymentMethod,
          totalAmount: total,
          items: cart.map((item) => {
            const suffix = [
              item.color && item.color !== 'Default' ? item.color : null,
              item.size || null,
            ]
              .filter(Boolean)
              .join(' / ')
            return {
              productId: item.productId,
              productName: suffix ? `${item.name} — ${suffix}` : item.name,
              quantity: item.quantity,
              price: item.price,
              color: item.color || null,
              size: item.size || null,
            }
          }),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Keep client session user in sync with profile updates from checkout
      if (user) {
        setUser({
          ...user,
          name: form.customerName.trim(),
          ...(form.customerEmail.trim()
            ? { email: form.customerEmail.trim() }
            : {}),
        })
      }

      const order = data.order || data

      setOrderId(order.id)
      clearCart()
      setView('confirmation')
      setLoading(false)
      if (data.invoiceEmailSent) {
        toast.success('Order placed — invoice emailed to you')
      } else if (data.invoiceEmailQueued && form.customerEmail.trim()) {
        toast.success(
          user ? 'Order placed — invoice will be emailed shortly' : 'Order placed — invoice will be emailed shortly'
        )
      } else if (form.customerEmail.trim()) {
        toast.success(
          user ? 'Order placed — profile updated' : 'Order placed successfully'
        )
        toast.message('Invoice email could not be sent right now. You can still download it later.')
      } else {
        toast.success(user ? 'Order placed — profile updated' : 'Order placed successfully')
      }
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      )
      setLoading(false)
    }
  }

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const goToProfile = () => {
    setAccountTab('profile')
    setView('account')
  }

  const ctaLabel = `Place COD order — ${format(total)}`

  if (!profileLoaded) {
    return (
      <section className="py-16 sm:py-24 bg-slate-50 min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 bg-slate-50 min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('cart')}
          className="mb-6 text-slate-500 hover:text-amber-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="rounded-xl border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Customer Information</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {user
                        ? 'Prefills from your profile. Edits here update your profile when you place the order.'
                        : 'Fill in your details to place the order. Sign in is optional.'}
                    </p>
                  </div>
                  {user ? (
                    <button
                      type="button"
                      onClick={goToProfile}
                      className="text-xs font-medium text-amber-700 hover:text-amber-800 underline-offset-2 hover:underline shrink-0"
                    >
                      View profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-xs font-medium text-amber-700 hover:text-amber-800 underline-offset-2 hover:underline shrink-0 inline-flex items-center gap-1"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Sign in
                    </button>
                  )}
                </div>
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
                    {errors.customerName && (
                      <p className="text-xs text-red-500">{errors.customerName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.customerEmail}
                      onChange={(e) => updateField('customerEmail', e.target.value)}
                      className={errors.customerEmail ? 'border-red-400' : ''}
                    />
                    {errors.customerEmail ? (
                      <p className="text-xs text-red-500">{errors.customerEmail}</p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        If provided, we email your invoice PDF automatically.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Mobile phone *</Label>
                    <Input
                      id="phone"
                      placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                      inputMode="tel"
                      value={form.customerPhone}
                      onChange={(e) => updateField('customerPhone', e.target.value)}
                      className={errors.customerPhone ? 'border-red-400' : ''}
                    />
                    {errors.customerPhone ? (
                      <p className="text-xs text-red-500">{errors.customerPhone}</p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        {user
                          ? 'Saved to your profile with this order.'
                          : 'Use a valid Bangladesh mobile number.'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Shipping Address</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {user
                        ? 'Changes here will update the address saved on your profile.'
                        : 'Enter the address where your order should be delivered.'}
                    </p>
                  </div>
                  {user ? (
                    <button
                      type="button"
                      onClick={goToProfile}
                      className="text-xs font-medium text-amber-700 hover:text-amber-800 underline-offset-2 hover:underline shrink-0"
                    >
                      View profile
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="House, road, area"
                      value={form.shippingAddress}
                      onChange={(e) => updateField('shippingAddress', e.target.value)}
                      className={errors.shippingAddress ? 'border-red-400' : ''}
                    />
                    {errors.shippingAddress && (
                      <p className="text-xs text-red-500">{errors.shippingAddress}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Dhaka"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className={errors.city ? 'border-red-400' : ''}
                    />
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Division *</Label>
                    <Input
                      id="state"
                      placeholder="Dhaka"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className={errors.state ? 'border-red-400' : ''}
                    />
                    {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Postal code (optional)</Label>
                    <Input
                      id="zip"
                      placeholder="1205"
                      value={form.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-xl border-slate-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                <FreeDeliveryProgress
                  subtotal={subtotal}
                  freeDeliveryMin={freeDeliveryMin}
                  className="mb-4"
                />
                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.color || 'default'}-${item.size || 'os'}`}
                      className="flex items-center gap-3"
                    >
                      <div className={`${productThumbClass} w-12 rounded-lg`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 h-full w-full object-fill"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity}
                          {item.color && item.color !== 'Default' ? ` · ${item.color}` : ''}
                          {item.size ? ` · ${item.size}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">{format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : format(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-xl font-bold text-amber-700">{format(total)}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold text-slate-900">Payment method</h4>
                  </div>

                  <div className="rounded-xl border-2 border-rose-600 bg-white p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white mb-2">
                      <Banknote className="h-4 w-4" />
                    </span>
                    <span className="block text-sm font-semibold text-rose-700 leading-snug">
                      Cash on Delivery
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 leading-snug">
                      Pay when your order is delivered
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-500/25"
                  onClick={() => void handleSubmit()}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    ctaLabel
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
