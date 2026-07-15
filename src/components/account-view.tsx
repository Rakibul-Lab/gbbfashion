'use client'

import { useCallback, useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  LogOut,
  Package,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Loader2,
  ArrowRight,
  Settings,
  Save,
  Lock,
  MapPin,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import type { AccountTab } from '@/lib/store'
import { useSiteLogo } from '@/hooks/use-site-logo'
import { useCurrency } from '@/hooks/use-currency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrderInvoiceDialog, type InvoiceOrder } from '@/components/order-invoice'
import {
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/lib/payment'

interface AccountProfile {
  id: string
  name: string
  email: string
  phone: string | null
  shippingAddress: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  role: string
  createdAt: string
}

interface AccountOrderItem {
  id: string
  productName: string
  quantity: number
  price: number
}

interface AccountOrder {
  id: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  shippingAddress?: string
  city?: string
  state?: string
  zipCode?: string
  totalAmount: number
  status: string
  paymentMethod?: string
  paymentStatus?: string
  sslCardType?: string | null
  sslBankTranId?: string | null
  transactionId?: string | null
  paidAt?: string | null
  createdAt: string
  items: AccountOrderItem[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-sky-100 text-sky-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
}

const tabs: { id: AccountTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function AccountView() {
  const { user, setUser, setView, accountTab, setAccountTab } = useStore()
  const { logoUrl } = useSiteLogo()
  const { format, symbol } = useCurrency()
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceOrder | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const loadAccount = useCallback(async () => {
    setLoading(true)
    try {
      const [meRes, ordersRes] = await Promise.all([
        fetch('/api/account/me', { cache: 'no-store' }),
        fetch('/api/orders?mine=1', { cache: 'no-store' }),
      ])

      if (meRes.ok) {
        const me = (await meRes.json()) as AccountProfile
        setProfile(me)
        setName(me.name)
        setEmail(me.email)
        setPhone(me.phone || '')
        setShippingAddress(me.shippingAddress || '')
        setCity(me.city || '')
        setState(me.state || '')
        setZipCode(me.zipCode || '')
        setUser({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
        })
      }

      if (ordersRes.ok) {
        const data = (await ordersRes.json()) as AccountOrder[]
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch {
      toast.error('Could not load your account')
    } finally {
      setLoading(false)
    }
  }, [setUser])

  useEffect(() => {
    void loadAccount()
  }, [loadAccount])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut({ redirect: false })
      setUser(null)
      toast.success('Signed out')
      setView('home')
    } catch {
      toast.error('Logout failed')
    } finally {
      setLoggingOut(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/account/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shippingAddress: shippingAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not update profile')
        return
      }
      const updated = data as AccountProfile
      setProfile(updated)
      setName(updated.name)
      setEmail(updated.email)
      setPhone(updated.phone || '')
      setShippingAddress(updated.shippingAddress || '')
      setCity(updated.city || '')
      setState(updated.state || '')
      setZipCode(updated.zipCode || '')
      setUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      })
      toast.success('Profile updated')
    } catch {
      toast.error('Could not update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/account/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not change password')
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated')
    } catch {
      toast.error('Could not change password')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  const displayName = profile?.name || user?.name || 'Customer'
  const displayEmail = profile?.email || user?.email || ''

  return (
    <section className="bg-slate-50 min-h-[70vh] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              My account
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Welcome, {displayName.split(' ')[0]}
            </h1>
            <p className="mt-2 text-slate-500 text-sm sm:text-base">
              Edit your profile, update settings, and track orders
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setView('shop')}
              className="rounded-lg"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue shopping
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Sign out
            </Button>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = accountTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAccountTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  active
                    ? 'bg-white text-slate-900 border border-slate-200 border-b-white -mb-px shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
              <div className="bg-slate-900 text-white px-5 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{displayName}</p>
                    <p className="text-sm text-white/60 truncate">{displayEmail}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const active = accountTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAccountTab(tab.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 mt-3">
                  <span className="font-medium text-slate-900">{orders.length}</span>{' '}
                  order{orders.length === 1 ? '' : 's'} with GBB Fashion
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {accountTab === 'profile' && (
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
                <CardHeader className="px-5 py-4 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-600" />
                    Edit profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
                    <div className="space-y-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Customer information
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="account-name" className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          Full name
                        </Label>
                        <Input
                          id="account-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          minLength={2}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-email" className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          Email
                        </Label>
                        <Input
                          id="account-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-phone" className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          Phone
                        </Label>
                        <Input
                          id="account-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Add your phone number"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-5 border-t border-slate-100 pt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        Shipping address
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="account-address">Address</Label>
                        <Input
                          id="account-address"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="House, road, area"
                          className="h-11"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="account-city">City</Label>
                          <Input
                            id="account-city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Dhaka"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-state">State / Division</Label>
                          <Input
                            id="account-state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="Dhaka"
                            className="h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 sm:max-w-[12rem]">
                        <Label htmlFor="account-zip">ZIP / Postal code</Label>
                        <Input
                          id="account-zip"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="1205"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                    >
                      {savingProfile ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {accountTab === 'settings' && (
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
                <CardHeader className="px-5 py-4 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-600" />
                    Change password
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={savingPassword}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                    >
                      {savingPassword ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Update password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {accountTab === 'orders' && (
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
                <CardHeader className="px-5 py-4 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-600" />
                    Order history
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {orders.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-900 font-medium">No orders yet</p>
                      <p className="text-sm text-slate-500 mt-1 mb-5">
                        When you place an order, it will show up here.
                      </p>
                      <Button
                        onClick={() => setView('shop')}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                      >
                        Browse products
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <div key={order.id} className="px-5 py-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 font-mono">
                                {order.id}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <Badge
                                  className={`text-[10px] uppercase tracking-wide border-0 ${
                                    statusColors[order.status] || 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {order.status}
                                </Badge>
                                {(order.paymentMethod || order.paymentStatus) && (
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    {paymentMethodLabel(order.paymentMethod)}
                                    {' · '}
                                    {paymentStatusLabel(order.paymentStatus)}
                                    {order.paymentStatus !== 'paid' &&
                                    order.status !== 'cancelled'
                                      ? ` · Due ${symbol}${order.totalAmount.toLocaleString()}`
                                      : ''}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm font-bold text-slate-900">
                                {format(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                          <ul className="space-y-1.5">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center justify-between gap-3 text-sm text-slate-600"
                              >
                                <span className="truncate">
                                  {item.productName} × {item.quantity}
                                </span>
                                <span className="shrink-0 font-medium text-slate-800">
                                  {format(item.price * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {order.status !== 'cancelled' && (
                            <div className="pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-lg h-8 text-xs"
                                onClick={() =>
                                  setInvoiceOrder({
                                    id: order.id,
                                    customerName:
                                      order.customerName || profile?.name || user?.name || '',
                                    customerEmail:
                                      order.customerEmail ||
                                      profile?.email ||
                                      user?.email ||
                                      '',
                                    customerPhone:
                                      order.customerPhone || profile?.phone || '',
                                    shippingAddress: order.shippingAddress,
                                    city: order.city,
                                    state: order.state,
                                    zipCode: order.zipCode,
                                    totalAmount: order.totalAmount,
                                    status: order.status,
                                    paymentMethod: order.paymentMethod,
                                    paymentStatus: order.paymentStatus,
                                    sslCardType: order.sslCardType,
                                    sslBankTranId: order.sslBankTranId,
                                    transactionId: order.transactionId,
                                    paidAt: order.paidAt,
                                    createdAt: order.createdAt,
                                    items: order.items,
                                  })
                                }
                              >
                                <FileText className="h-3.5 w-3.5 mr-1.5" />
                                Download invoice
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      <OrderInvoiceDialog
        open={!!invoiceOrder}
        onOpenChange={(open) => {
          if (!open) setInvoiceOrder(null)
        }}
        order={invoiceOrder}
        logoUrl={logoUrl}
        currencySymbol={symbol}
      />
    </section>
  )
}
