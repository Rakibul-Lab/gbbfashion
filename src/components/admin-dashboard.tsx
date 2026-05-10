'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Video,
  ShoppingCart,
  Users,
  Home,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  DollarSign,
  Menu,
  X,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number | null
  category: string
  image: string
  secondaryImage: string | null
  features: string
  rating: number
  inStock: boolean
  badge: string | null
  colors: string | null
  collection: string | null
  hasFlash: boolean
  createdAt: string
}

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  totalAmount: number
  status: string
  items: OrderItem[]
  createdAt: string
}

interface Reel {
  id: string
  title: string
  productName: string
  price: number
  originalPrice: number | null
  videoSrc: string
  videoThumbnail: string
  thumbnail: string
  colors: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  createdAt: string
}

type AdminPage = 'overview' | 'products' | 'reels' | 'orders' | 'users'

// ─── Constants ───────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-teal-100 text-teal-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

const categoryOptions = [
  { value: 'women', label: "Women's Bags" },
  { value: 'men', label: "Men's Bags" },
  { value: 'shoes', label: 'Shoes' },
  { value: 'belt', label: 'Belt' },
  { value: 'kids', label: 'Kids' },
  { value: 'accessories', label: 'Accessories' },
]

const badgeOptions = [
  { value: '', label: 'None' },
  { value: 'Best Seller', label: 'Best Seller' },
  { value: 'New', label: 'New' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Popular', label: 'Popular' },
  { value: 'Sale', label: 'Sale' },
]

const collectionOptions = [
  { value: '', label: 'None' },
  { value: 'bags', label: 'Bags' },
  { value: 'shoes', label: 'Shoes' },
]

const emptyProduct: Omit<Product, 'id' | 'createdAt'> = {
  name: '',
  description: '',
  price: 0,
  originalPrice: null,
  category: 'women',
  image: '/products/women-hand-bag.png',
  secondaryImage: null,
  features: '',
  rating: 4.5,
  inStock: true,
  badge: null,
  colors: null,
  collection: null,
  hasFlash: false,
}

const emptyReel: Omit<Reel, 'id' | 'createdAt'> = {
  title: '',
  productName: '',
  price: 0,
  originalPrice: null,
  videoSrc: '',
  videoThumbnail: '',
  thumbnail: '',
  colors: null,
  isActive: true,
  sortOrder: 0,
}

const FBT = '৳'

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const setView = useStore((s) => s.setView)
  const setUser = useStore((s) => s.setUser)
  const user = useStore((s) => s.user)

  // Navigation
  const [activePage, setActivePage] = useState<AdminPage>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reels, setReels] = useState<Reel[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Product dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  // Reel dialog
  const [reelDialogOpen, setReelDialogOpen] = useState(false)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)
  const [reelForm, setReelForm] = useState(emptyReel)
  const [savingReel, setSavingReel] = useState(false)

  // Order state
  const [orderFilter, setOrderFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'reel'; id: string } | null>(null)

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchReels = useCallback(async () => {
    try {
      const res = await fetch('/api/reels')
      const data = await res.json()
      setReels(data)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchOrders(), fetchReels(), fetchUsers()])
      setLoading(false)
    }
    load()
  }, [fetchProducts, fetchOrders, fetchReels, fetchUsers])

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const totalProducts = products.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalUsers = users.length

  const revenueByCategory = categoryOptions.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat.value)
    const catOrders = orders.filter((o) =>
      o.items.some((item) => catProducts.some((p) => p.id === item.productId))
    )
    const revenue = catOrders.reduce((s, o) => s + o.totalAmount, 0)
    return {
      name: cat.label.split(' ')[0],
      products: catProducts.length,
      revenue: Math.round(revenue),
    }
  })

  const recentOrders = orders.slice(0, 5)

  // ─── Product handlers ──────────────────────────────────────────────────────

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      toast.error('Product name is required')
      return
    }
    setSavingProduct(true)
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        })
        if (!res.ok) throw new Error()
        toast.success('Product updated')
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        })
        if (!res.ok) throw new Error()
        toast.success('Product created')
      }
      setProductDialogOpen(false)
      setEditingProduct(null)
      setProductForm(emptyProduct)
      fetchProducts()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Product deleted')
      fetchProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.image,
      secondaryImage: product.secondaryImage,
      features: product.features,
      rating: product.rating,
      inStock: product.inStock,
      badge: product.badge,
      colors: product.colors,
      collection: product.collection,
      hasFlash: product.hasFlash,
    })
    setProductDialogOpen(true)
  }

  const openCreateProduct = () => {
    setEditingProduct(null)
    setProductForm(emptyProduct)
    setProductDialogOpen(true)
  }

  // ─── Reel handlers ────────────────────────────────────────────────────────

  const handleSaveReel = async () => {
    if (!reelForm.title.trim()) {
      toast.error('Reel title is required')
      return
    }
    setSavingReel(true)
    try {
      if (editingReel) {
        const res = await fetch(`/api/reels/${editingReel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reelForm),
        })
        if (!res.ok) throw new Error()
        toast.success('Reel updated')
      } else {
        const res = await fetch('/api/reels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reelForm),
        })
        if (!res.ok) throw new Error()
        toast.success('Reel created')
      }
      setReelDialogOpen(false)
      setEditingReel(null)
      setReelForm(emptyReel)
      fetchReels()
    } catch {
      toast.error('Failed to save reel')
    } finally {
      setSavingReel(false)
    }
  }

  const handleDeleteReel = async (id: string) => {
    try {
      const res = await fetch(`/api/reels/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Reel deleted')
      fetchReels()
    } catch {
      toast.error('Failed to delete reel')
    }
  }

  const openEditReel = (reel: Reel) => {
    setEditingReel(reel)
    setReelForm({
      title: reel.title,
      productName: reel.productName,
      price: reel.price,
      originalPrice: reel.originalPrice,
      videoSrc: reel.videoSrc,
      videoThumbnail: reel.videoThumbnail,
      thumbnail: reel.thumbnail,
      colors: reel.colors,
      isActive: reel.isActive,
      sortOrder: reel.sortOrder,
    })
    setReelDialogOpen(true)
  }

  const openCreateReel = () => {
    setEditingReel(null)
    setReelForm(emptyReel)
    setReelDialogOpen(true)
  }

  // ─── Order handlers ────────────────────────────────────────────────────────

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success('Order status updated')
      fetchOrders()
    } catch {
      toast.error('Failed to update order')
    }
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setUser(null)
    setView('home')
  }

  // ─── Delete dialog ─────────────────────────────────────────────────────────

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'product') {
      handleDeleteProduct(deleteTarget.id)
    } else {
      handleDeleteReel(deleteTarget.id)
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const openDeleteDialog = (type: 'product' | 'reel', id: string) => {
    setDeleteTarget({ type, id })
    setDeleteDialogOpen(true)
  }

  // ─── Filtered data ─────────────────────────────────────────────────────────

  const filteredProducts = productSearch
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(productSearch.toLowerCase())
      )
    : products

  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter)

  // ─── Sidebar navigation items ──────────────────────────────────────────────

  const navItems: { page: AdminPage; icon: typeof LayoutDashboard; label: string }[] = [
    { page: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { page: 'products', icon: Package, label: 'Products' },
    { page: 'reels', icon: Video, label: 'Reels' },
    { page: 'orders', icon: ShoppingCart, label: 'Orders' },
    { page: 'users', icon: Users, label: 'Users' },
  ]

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <span className="font-bold text-sm text-white">G</span>
              </div>
              <span className="font-bold text-lg tracking-wide">GBB Fashion</span>
            </div>
            <button
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.page
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    setActivePage(item.page)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              )
            })}
          </nav>

          <Separator className="bg-slate-700/50" />

          {/* Bottom nav */}
          <div className="px-3 py-4 space-y-1">
            <button
              onClick={() => setView('home')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home className="h-5 w-5 text-slate-400" />
              <span>Back to Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5 text-slate-400" />
              <span>Logout</span>
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="px-4 py-3 border-t border-slate-700/50">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Top bar on mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-bold text-lg text-slate-900 capitalize">{activePage}</h1>
        </header>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'overview' && <OverviewPage />}
              {activePage === 'products' && <ProductsPage />}
              {activePage === 'reels' && <ReelsPage />}
              {activePage === 'orders' && <OrdersPage />}
              {activePage === 'users' && <UsersPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Row 1: Name */}
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Product name"
              />
            </div>

            {/* Row 2: Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Product description"
                rows={3}
              />
            </div>

            {/* Row 3: Price + Original Price + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price ({FBT}) *</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Original Price ({FBT})</Label>
                <Input
                  type="number"
                  value={productForm.originalPrice ?? ''}
                  onChange={(e) => setProductForm((p) => ({ ...p, originalPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(v) => setProductForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Image + Secondary Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={productForm.image}
                  onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="/products/example.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Image URL</Label>
                <Input
                  value={productForm.secondaryImage ?? ''}
                  onChange={(e) => setProductForm((p) => ({ ...p, secondaryImage: e.target.value || null }))}
                  placeholder="/products/example-2.png"
                />
              </div>
            </div>

            {/* Row 5: Features */}
            <div className="space-y-2">
              <Label>Features (pipe-separated)</Label>
              <Input
                value={productForm.features}
                onChange={(e) => setProductForm((p) => ({ ...p, features: e.target.value }))}
                placeholder="Feature 1|Feature 2|Feature 3"
              />
            </div>

            {/* Row 6: Rating + Badge + Collection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={productForm.rating}
                  onChange={(e) => setProductForm((p) => ({ ...p, rating: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Select
                  value={productForm.badge ?? ''}
                  onValueChange={(v) => setProductForm((p) => ({ ...p, badge: v || null }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badgeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value || '__none__'}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Collection</Label>
                <Select
                  value={productForm.collection ?? ''}
                  onValueChange={(v) => setProductForm((p) => ({ ...p, collection: v || null }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value || '__none__'}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 7: Colors */}
            <div className="space-y-2">
              <Label>Colors (comma-separated hex values)</Label>
              <Input
                value={productForm.colors ?? ''}
                onChange={(e) => setProductForm((p) => ({ ...p, colors: e.target.value || null }))}
                placeholder="#000000,#FFFFFF,#8B4513"
              />
            </div>

            {/* Row 8: Switches */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={productForm.inStock}
                  onCheckedChange={(v) => setProductForm((p) => ({ ...p, inStock: v }))}
                />
                <Label>In Stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={productForm.hasFlash}
                  onCheckedChange={(v) => setProductForm((p) => ({ ...p, hasFlash: v }))}
                />
                <Label>Flash Delivery</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={savingProduct}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {savingProduct && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reel Dialog */}
      <Dialog open={reelDialogOpen} onOpenChange={setReelDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReel ? 'Edit Reel' : 'Add New Reel'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={reelForm.title}
                  onChange={(e) => setReelForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Reel title"
                />
              </div>
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={reelForm.productName}
                  onChange={(e) => setReelForm((p) => ({ ...p, productName: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ({FBT}) *</Label>
                <Input
                  type="number"
                  value={reelForm.price}
                  onChange={(e) => setReelForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Original Price ({FBT})</Label>
                <Input
                  type="number"
                  value={reelForm.originalPrice ?? ''}
                  onChange={(e) => setReelForm((p) => ({ ...p, originalPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Video Source URL *</Label>
              <Input
                value={reelForm.videoSrc}
                onChange={(e) => setReelForm((p) => ({ ...p, videoSrc: e.target.value }))}
                placeholder="/reels/video-1.mp4"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Video Thumbnail URL</Label>
                <Input
                  value={reelForm.videoThumbnail}
                  onChange={(e) => setReelForm((p) => ({ ...p, videoThumbnail: e.target.value }))}
                  placeholder="/reels/thumb-1.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <Input
                  value={reelForm.thumbnail}
                  onChange={(e) => setReelForm((p) => ({ ...p, thumbnail: e.target.value }))}
                  placeholder="/reels/thumb-1.png"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Colors (comma-separated hex values)</Label>
              <Input
                value={reelForm.colors ?? ''}
                onChange={(e) => setReelForm((p) => ({ ...p, colors: e.target.value || null }))}
                placeholder="#000000,#FFFFFF"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={reelForm.isActive}
                  onCheckedChange={(v) => setReelForm((p) => ({ ...p, isActive: v }))}
                />
                <Label>Active</Label>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={reelForm.sortOrder}
                  onChange={(e) => setReelForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReelDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveReel}
              disabled={savingReel}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {savingReel && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {editingReel ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // ─── Overview Page ─────────────────────────────────────────────────────────

  function OverviewPage() {
    const statCards = [
      { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-slate-700', bg: 'bg-slate-100' },
      { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: `Total Revenue (${FBT})`, value: `${FBT}${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name || 'Admin'}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-xl border-slate-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Products by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="products" fill="#b45309" radius={[4, 4, 0, 0]} name="Products" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="rounded-xl border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:text-amber-700"
              onClick={() => setActivePage('orders')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{order.customerName}</p>
                            <p className="text-xs text-slate-500">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {FBT}{order.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={openCreateProduct}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
              <Button
                onClick={openCreateReel}
                variant="outline"
                className="rounded-lg"
              >
                <Video className="h-4 w-4 mr-1" />
                Add Reel
              </Button>
              <Button
                onClick={() => setActivePage('orders')}
                variant="outline"
                className="rounded-lg"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Products Page ─────────────────────────────────────────────────────────

  function ProductsPage() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Products</h2>
            <p className="text-slate-500 text-sm mt-1">{products.length} total products</p>
          </div>
          <Button
            onClick={openCreateProduct}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>

        {/* Table */}
        <Card className="rounded-xl border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price ({FBT})</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                            {product.badge && (
                              <Badge variant="secondary" className="text-[10px] mt-0.5">
                                {product.badge}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-slate-600">{product.category}</TableCell>
                        <TableCell className="font-medium">{FBT}{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? 'default' : 'destructive'} className="text-xs">
                            {product.inStock ? 'In Stock' : 'Out'}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.rating}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditProduct(product)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => openDeleteDialog('product', product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Reels Page ────────────────────────────────────────────────────────────

  function ReelsPage() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Reels</h2>
            <p className="text-slate-500 text-sm mt-1">{reels.length} total reels</p>
          </div>
          <Button
            onClick={openCreateReel}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Reel
          </Button>
        </div>

        {reels.length === 0 ? (
          <Card className="rounded-xl border-slate-200">
            <CardContent className="text-center py-12 text-slate-500">
              No reels yet. Create your first reel!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reels.map((reel) => (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-xl border-slate-200 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative aspect-[9/16] bg-slate-100">
                    <img
                      src={reel.videoThumbnail || reel.thumbnail}
                      alt={reel.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Active badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        className={`text-[10px] ${
                          reel.isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-500 text-white'
                        }`}
                      >
                        {reel.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {/* Sort order */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-[10px]">
                        #{reel.sortOrder}
                      </Badge>
                    </div>
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{reel.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{reel.productName}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {FBT}{reel.price.toLocaleString()}
                      </span>
                      {reel.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {FBT}{reel.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Colors preview */}
                    {reel.colors && (
                      <div className="flex items-center gap-1">
                        {reel.colors.split(',').map((color, idx) => (
                          <div
                            key={idx}
                            className="h-4 w-4 rounded-full border border-slate-200"
                            style={{ backgroundColor: color.trim() }}
                          />
                        ))}
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg"
                        onClick={() => openEditReel(reel)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteDialog('reel', reel.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Orders Page ───────────────────────────────────────────────────────────

  function OrdersPage() {
    const statusFilters = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
          <p className="text-slate-500 text-sm mt-1">{orders.length} total orders</p>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <Button
              key={status}
              variant={orderFilter === status ? 'default' : 'outline'}
              size="sm"
              className={`rounded-lg capitalize ${
                orderFilter === status ? 'bg-slate-900 hover:bg-slate-800 text-white' : ''
              }`}
              onClick={() => setOrderFilter(status)}
            >
              {status}
              {status !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({orders.filter((o) => o.status === status).length})
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Table */}
        <Card className="rounded-xl border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total ({FBT})</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <>
                        <TableRow key={order.id}>
                          <TableCell>
                            <button
                              onClick={() =>
                                setExpandedOrder(expandedOrder === order.id ? null : order.id)
                              }
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {expandedOrder === order.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{order.customerName}</p>
                              <p className="text-xs text-slate-500">{order.customerEmail}</p>
                              <p className="text-xs text-slate-400">{order.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {order.items.length} item(s)
                          </TableCell>
                          <TableCell className="font-medium">
                            {FBT}{order.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="h-8 w-32 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                        {/* Expanded order details */}
                        {expandedOrder === order.id && (
                          <TableRow key={`${order.id}-detail`}>
                            <TableCell colSpan={8} className="bg-slate-50/50 px-8 py-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">Order Items</p>
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-slate-600">
                                      {item.productName} × {item.quantity}
                                    </span>
                                    <span className="font-medium text-slate-900">
                                      {FBT}{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                                <Separator />
                                <div className="flex items-center justify-between text-sm font-semibold">
                                  <span>Total</span>
                                  <span>{FBT}{order.totalAmount.toLocaleString()}</span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Users Page ────────────────────────────────────────────────────────────

  function UsersPage() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Users</h2>
          <p className="text-slate-500 text-sm mt-1">{users.length} registered users</p>
        </div>

        <Card className="rounded-xl border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                        <TableCell className="text-slate-600">{u.email}</TableCell>
                        <TableCell className="text-slate-600">{u.phone || '—'}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
