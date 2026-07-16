'use client'

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react'
import { useStore } from '@/lib/store'
import { productThumbClass } from '@/lib/product-image'
import {
  parseGalleryImages,
  serializeGalleryImages,
  colorNamesFromGallery,
  type ProductColorVariant,
} from '@/lib/product-colors'
import {
  parseReelColors,
  serializeReelColors,
  type ReelColorVariant,
} from '@/lib/reel-colors'
import { inStockFromQuantity, normalizeStock } from '@/lib/stock'
import { useSiteLogo } from '@/hooks/use-site-logo'
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
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Menu,
  X,
  Settings,
  Upload,
  ImageIcon,
  RotateCcw,
  Save,
  FileText,
  FolderTree,
  LayoutGrid,
  Images,
  Sparkles,
  Star,
  UserCircle,
  Truck,
  MessageCircle,
  Banknote,
  Share2,
  Mail,
  Construction,
} from 'lucide-react'
import { OrderInvoiceDialog, type InvoiceOrder } from '@/components/order-invoice'
import { MediaLibraryModal, type MediaItem } from '@/components/media-library-modal'
import { MediaPickerButton } from '@/components/media-picker-button'
import { AdminCategoriesPage } from '@/components/admin-categories-page'
import { AdminContentPage } from '@/components/admin-content-page'
import { AdminUsersPage } from '@/components/admin-users-page'
import { AdminProfilePage } from '@/components/admin-profile-page'
import { useCurrency, broadcastCurrency } from '@/hooks/use-currency'
import { broadcastStoreSettings } from '@/hooks/use-store-commerce'
import {
  CURRENCIES,
  currencyLabel,
  DEFAULT_CURRENCY_CODE,
  formatMoney as formatCurrencyAmount,
} from '@/lib/currency'
import {
  DEFAULT_DELIVERY_CHARGE,
  DEFAULT_FACEBOOK_URL,
  DEFAULT_FREE_DELIVERY_MIN,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_TIKTOK_URL,
  DEFAULT_WHATSAPP_ICON_ID,
  DEFAULT_WHATSAPP_ICON_URL,
  DEFAULT_WHATSAPP_NUMBER,
  WHATSAPP_ICON_PRESETS,
  type WhatsAppIconId,
} from '@/lib/site-settings-client'
import {
  DEFAULT_INVOICE_EMAIL,
  INVOICE_EMAIL_TEMPLATES,
  normalizeInvoiceEmailSettings,
  type InvoiceEmailSettings,
  type InvoiceEmailTemplateId,
} from '@/lib/invoice-email-settings'
import {
  DEFAULT_MAINTENANCE,
  normalizeMaintenanceSettings,
  type MaintenanceSettings,
} from '@/lib/maintenance-settings'
import { broadcastMaintenance } from '@/hooks/use-maintenance-mode'
import { WhatsAppIconButton } from '@/components/whatsapp-icon'
import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/lib/payment'
// Using simple CSS-based chart instead of recharts for performance

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
  galleryImages: string | null
  features: string
  rating: number
  stock: number
  inStock: boolean
  badge: string | null
  colors: string | null
  collection: string | null
  hasFlash: boolean
  subCategory: string | null
  isNewArrival: boolean
  isPrimeDrop: boolean
  isFeatured: boolean
  sortOrder: number
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
  stock: number
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
  source?: string
  phone: string | null
  createdAt: string
}

type AdminPage =
  | 'overview'
  | 'products'
  | 'categories'
  | 'content'
  | 'reels'
  | 'orders'
  | 'users'
  | 'profile'
  | 'settings'

// ─── Constants ───────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-teal-100 text-teal-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-orange-100 text-orange-700',
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
  { value: 'bags', label: 'Prime Bags (homepage)' },
  { value: 'shoes', label: 'Prime Shoes (homepage)' },
]

const emptyProduct: Omit<Product, 'id' | 'createdAt'> = {
  name: '',
  description: '',
  price: 0,
  originalPrice: null,
  category: 'women',
  image: '',
  secondaryImage: null,
  galleryImages: null,
  features: '',
  rating: 0,
  stock: 100,
  inStock: true,
  badge: null,
  colors: null,
  collection: null,
  hasFlash: false,
  subCategory: null,
  isNewArrival: false,
  isPrimeDrop: false,
  isFeatured: false,
  sortOrder: 0,
}

const emptyReel: Omit<Reel, 'id' | 'createdAt'> = {
  title: '',
  productName: '',
  price: 0,
  originalPrice: null,
  videoSrc: '',
  videoThumbnail: '',
  thumbnail: '',
  stock: 50,
  colors: null,
  isActive: true,
  sortOrder: 0,
}

const PRODUCTS_PER_PAGE = 10
const REELS_PER_PAGE = 10

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const setView = useStore((s) => s.setView)
  const setUser = useStore((s) => s.setUser)
  const user = useStore((s) => s.user)
  const { logoUrl, logoWidth, logoHeight } = useSiteLogo()
  const { symbol: currencySymbol, format: formatMoney, code: currencyCode } = useCurrency()

  // Navigation
  const [activePage, setActivePage] = useState<AdminPage>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reels, setReels] = useState<Reel[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Product editor (inline — no modal)
  const [productEditorOpen, setProductEditorOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [savingProduct, setSavingProduct] = useState(false)
  /** WordPress-style media picker target */
  const [mediaPicker, setMediaPicker] = useState<null | 'primary' | number>(null)
  const [colorVariants, setColorVariants] = useState<ProductColorVariant[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productPage, setProductPage] = useState(1)

  // Reel dialog
  const [reelDialogOpen, setReelDialogOpen] = useState(false)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)
  const [reelForm, setReelForm] = useState(emptyReel)
  const [reelColorVariants, setReelColorVariants] = useState<ReelColorVariant[]>([])
  const [savingReel, setSavingReel] = useState(false)
  const [reelSearch, setReelSearch] = useState('')
  const [reelStatusFilter, setReelStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [reelPage, setReelPage] = useState(1)

  // Order state
  const [orderFilter, setOrderFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [draftOrderStatuses, setDraftOrderStatuses] = useState<Record<string, string>>({})
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceOrder | null>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'reel' | 'order'; id: string } | null>(null)

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
      if (Array.isArray(data)) setUsers(data)
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
    if (!productForm.image.trim()) {
      toast.error('Please upload a product image')
      return
    }
    setSavingProduct(true)
    try {
      const galleryImages = serializeGalleryImages(colorVariants)
      const colors = colorNamesFromGallery(colorVariants)
      const secondaryImage =
        productForm.secondaryImage ||
        colorVariants.find((v) => v.image && v.image !== productForm.image)?.image ||
        null
      const payload = {
        ...productForm,
        rating: 0,
        stock: normalizeStock(productForm.stock, 0),
        inStock: inStockFromQuantity(normalizeStock(productForm.stock, 0)),
        galleryImages,
        colors,
        secondaryImage,
      }
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Product updated')
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast.success('Product published')
      }
      setProductEditorOpen(false)
      setEditingProduct(null)
      setProductForm(emptyProduct)
      setColorVariants([])
      fetchProducts()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSavingProduct(false)
    }
  }

  const closeProductEditor = () => {
    setProductEditorOpen(false)
    setEditingProduct(null)
    setProductForm(emptyProduct)
    setColorVariants([])
  }

  const handleMediaLibrarySelect = (url: string) => {
    if (mediaPicker === 'primary') {
      setProductForm((p) => ({ ...p, image: url }))
      toast.success('Featured image selected')
    } else if (typeof mediaPicker === 'number') {
      const index = mediaPicker
      setColorVariants((prev) =>
        prev.map((v, i) => (i === index ? { ...v, image: url } : v))
      )
      toast.success('Color image selected')
    }
    setMediaPicker(null)
  }

  const addColorVariant = () => {
    setColorVariants((prev) => [
      ...prev,
      { name: `Color ${prev.length + 1}`, swatch: '#1a1a1a', image: '' },
    ])
  }

  const removeColorVariant = (index: number) => {
    setColorVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to delete product'
        )
      }
      toast.success('Product deleted')
      if (editingProduct?.id === id) {
        setEditingProduct(null)
        setProductForm(emptyProduct)
        setColorVariants([])
      }
      fetchProducts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product')
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
      galleryImages: product.galleryImages ?? null,
      features: product.features,
      rating: 0,
      stock: typeof product.stock === 'number' ? product.stock : product.inStock ? 100 : 0,
      inStock: product.inStock,
      badge: product.badge,
      colors: product.colors,
      collection: product.collection,
      hasFlash: product.hasFlash,
      subCategory: product.subCategory ?? null,
      isNewArrival: product.isNewArrival ?? false,
      isPrimeDrop: product.isPrimeDrop ?? false,
      isFeatured: product.isFeatured ?? false,
      sortOrder: product.sortOrder ?? 0,
    })
    const fromGallery = parseGalleryImages(product.galleryImages)
    if (fromGallery.some((v) => v.image)) {
      setColorVariants(fromGallery)
    } else {
      // Build variants from legacy colors + featured/secondary images
      const legacy = parseGalleryImages(product.colors)
      setColorVariants(
        legacy.map((v, i) => ({
          ...v,
          image: i === 0 ? product.image : product.secondaryImage || product.image,
        }))
      )
    }
    setProductEditorOpen(true)
    setActivePage('products')
  }

  const openCreateProduct = () => {
    setEditingProduct(null)
    setProductForm(emptyProduct)
    setColorVariants([])
    setProductEditorOpen(true)
    setActivePage('products')
  }

  // ─── Reel handlers ────────────────────────────────────────────────────────

  const addReelColorVariant = () => {
    setReelColorVariants((prev) => [
      ...prev,
      { name: `Color ${prev.length + 1}`, hex: '#1a1a1a', image: '' },
    ])
  }

  const removeReelColorVariant = (index: number) => {
    setReelColorVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveReel = async () => {
    if (!reelForm.title.trim()) {
      toast.error('Reel title is required')
      return
    }
    if (!reelForm.productName.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!reelForm.videoSrc.trim()) {
      toast.error('Please upload a reel video')
      return
    }
    if (!reelForm.thumbnail.trim()) {
      toast.error('Please upload a product image')
      return
    }
    if (!reelForm.price || reelForm.price <= 0) {
      toast.error('Enter a valid product price')
      return
    }
    setSavingReel(true)
    try {
      const stock = normalizeStock(reelForm.stock, 0)
      const payload = {
        ...reelForm,
        stock,
        colors: serializeReelColors(reelColorVariants),
        videoThumbnail: reelForm.videoThumbnail || reelForm.thumbnail,
      }
      if (editingReel) {
        const res = await fetch(`/api/reels/${editingReel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(typeof data.error === 'string' ? data.error : 'Failed to update')
        }
        toast.success('Reel updated')
      } else {
        const res = await fetch('/api/reels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(typeof data.error === 'string' ? data.error : 'Failed to create')
        }
        toast.success('Reel created')
      }
      setReelDialogOpen(false)
      setEditingReel(null)
      setReelForm(emptyReel)
      setReelColorVariants([])
      fetchReels()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save reel')
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
      stock: typeof reel.stock === 'number' ? reel.stock : 0,
      colors: reel.colors,
      isActive: reel.isActive,
      sortOrder: reel.sortOrder,
    })
    setReelColorVariants(parseReelColors(reel.colors))
    setReelDialogOpen(true)
  }

  const openCreateReel = () => {
    setEditingReel(null)
    setReelForm(emptyReel)
    setReelColorVariants([])
    setReelDialogOpen(true)
  }

  // ─── Order handlers ────────────────────────────────────────────────────────

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setSavingOrderId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(
        status === 'delivered'
          ? 'Order marked delivered'
          : 'Order status saved'
      )
      setDraftOrderStatuses((prev) => {
        const next = { ...prev }
        delete next[orderId]
        return next
      })
      fetchOrders()
    } catch {
      toast.error('Failed to update order')
    } finally {
      setSavingOrderId(null)
    }
  }

  const handleCashReceived = async (orderId: string) => {
    setSavingOrderId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: PAYMENT_STATUS.PAID }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to mark cash received'
        )
      }
      toast.success('Cash received — payment marked as paid')
      if (invoiceOrder?.id === orderId) {
        setInvoiceOrder({
          ...invoiceOrder,
          paymentStatus: PAYMENT_STATUS.PAID,
          paidAt: data.paidAt || new Date().toISOString(),
        })
      }
      fetchOrders()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark cash received')
    } finally {
      setSavingOrderId(null)
    }
  }

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Order deleted')
      if (invoiceOrder?.id === id) setInvoiceOrder(null)
      if (expandedOrder === id) setExpandedOrder(null)
      setDraftOrderStatuses((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      fetchOrders()
    } catch {
      toast.error('Failed to delete order')
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
    } else if (deleteTarget.type === 'reel') {
      handleDeleteReel(deleteTarget.id)
    } else {
      handleDeleteOrder(deleteTarget.id)
    }
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const openDeleteDialog = (type: 'product' | 'reel' | 'order', id: string) => {
    setDeleteTarget({ type, id })
    setDeleteDialogOpen(true)
  }

  // ─── Filtered + paginated data ─────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.badge ?? '').toLowerCase().includes(q)
    )
  }, [products, productSearch])

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))
  const paginatedProducts = useMemo(() => {
    const page = Math.min(productPage, productTotalPages)
    const start = (page - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [filteredProducts, productPage, productTotalPages])

  const filteredReels = useMemo(() => {
    const q = reelSearch.trim().toLowerCase()
    return reels.filter((r) => {
      if (reelStatusFilter === 'active' && !r.isActive) return false
      if (reelStatusFilter === 'inactive' && r.isActive) return false
      if (!q) return true
      return (
        r.title.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        String(r.price).includes(q)
      )
    })
  }, [reels, reelSearch, reelStatusFilter])

  const reelTotalPages = Math.max(1, Math.ceil(filteredReels.length / REELS_PER_PAGE))
  const paginatedReels = useMemo(() => {
    const page = Math.min(reelPage, reelTotalPages)
    const start = (page - 1) * REELS_PER_PAGE
    return filteredReels.slice(start, start + REELS_PER_PAGE)
  }, [filteredReels, reelPage, reelTotalPages])

  useEffect(() => {
    setProductPage(1)
  }, [productSearch])

  useEffect(() => {
    setReelPage(1)
  }, [reelSearch, reelStatusFilter])

  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter)

  // ─── Sidebar navigation items ──────────────────────────────────────────────

  const navItems: { page: AdminPage; icon: typeof LayoutDashboard; label: string }[] = [
    { page: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { page: 'products', icon: Package, label: 'Products' },
    { page: 'categories', icon: FolderTree, label: 'Categories' },
    { page: 'content', icon: LayoutGrid, label: 'Website' },
    { page: 'reels', icon: Video, label: 'Reels' },
    { page: 'orders', icon: ShoppingCart, label: 'Orders' },
    { page: 'users', icon: Users, label: 'Users' },
    { page: 'profile', icon: UserCircle, label: 'Profile' },
    { page: 'settings', icon: Settings, label: 'Settings' },
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
                <span
                  className="relative shrink-0 overflow-hidden rounded-lg bg-white/10"
                  style={{
                    width: Math.min(logoWidth, 48),
                    height: Math.min(logoHeight, 48),
                  }}
                >
                  <img
                    src={logoUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-fill object-center"
                  />
                </span>
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
            <button
              type="button"
              onClick={() => {
                setActivePage('profile')
                setSidebarOpen(false)
              }}
              className="px-4 py-3 border-t border-slate-700/50 text-left w-full hover:bg-slate-800/60 transition-colors"
            >
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                View profile
              </p>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
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
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'overview' && OverviewPage()}
              {activePage === 'products' && ProductsPage()}
              {activePage === 'categories' && <AdminCategoriesPage />}
              {activePage === 'content' && <AdminContentPage />}
              {activePage === 'reels' && ReelsPage()}
              {activePage === 'orders' && OrdersPage()}
              {activePage === 'users' && (
                <AdminUsersPage users={users} onRefresh={fetchUsers} />
              )}
              {activePage === 'profile' && <AdminProfilePage />}
              {activePage === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-4">
          <p className="text-xs text-slate-500 text-center">
            Developed by:{' '}
            <span className="text-slate-600">Ahanaf Adud &amp; Rakibul Hassan</span>
          </p>
        </footer>
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

      <OrderInvoiceDialog
        open={!!invoiceOrder}
        onOpenChange={(open) => {
          if (!open) setInvoiceOrder(null)
        }}
        order={invoiceOrder}
        logoUrl={logoUrl}
        currencySymbol={currencySymbol}
      />

      <MediaLibraryModal
        open={mediaPicker !== null}
        onOpenChange={(open) => {
          if (!open) setMediaPicker(null)
        }}
        currentUrl={
          mediaPicker === 'primary'
            ? productForm.image
            : typeof mediaPicker === 'number'
              ? colorVariants[mediaPicker]?.image || ''
              : ''
        }
        title={
          mediaPicker === 'primary'
            ? 'Select featured image'
            : typeof mediaPicker === 'number'
              ? `Select image — ${colorVariants[mediaPicker]?.name || 'color'}`
              : 'Media library'
        }
        folder="products"
        accept="image"
        onSelect={handleMediaLibrarySelect}
      />

      {/* Product Dialog removed — inline editor on Products page */}

      {/* Reel Dialog */}
      <Dialog
        open={reelDialogOpen}
        onOpenChange={(open) => {
          setReelDialogOpen(open)
          if (!open) {
            setEditingReel(null)
            setReelForm(emptyReel)
            setReelColorVariants([])
          }
        }}
      >
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] sm:max-w-6xl lg:max-w-7xl max-h-[92vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-xl">
              {editingReel ? 'Edit reel' : 'Add new reel'}
            </DialogTitle>
            <p className="text-sm text-slate-500 font-normal">
              Upload the video, product photos, and inventory in one place.
            </p>
          </DialogHeader>

          <div className="px-6 py-5 space-y-6">
            {/* Title + status */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="reel-title">Reel title *</Label>
                <Input
                  id="reel-title"
                  value={reelForm.title}
                  onChange={(e) => setReelForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Butterfly Bag — Soft Leather"
                  className="h-11"
                />
              </div>
              <div className="flex items-center gap-3 pb-1">
                <Switch
                  checked={reelForm.isActive}
                  onCheckedChange={(v) => setReelForm((p) => ({ ...p, isActive: v }))}
                />
                <Label>Active on storefront</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video column */}
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Reel video</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    MP4 / WEBM / MOV · up to 80MB
                  </p>
                </div>

                <div className="relative aspect-[9/16] max-h-[360px] mx-auto w-full max-w-[220px] rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-sm">
                  {reelForm.videoSrc ? (
                    <video
                      src={reelForm.videoSrc}
                      className="absolute inset-0 h-full w-full object-cover"
                      controls
                      muted
                      playsInline
                      poster={reelForm.videoThumbnail || reelForm.thumbnail || undefined}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                      <Video className="h-8 w-8 opacity-50" />
                      <p className="text-xs">No video yet</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <MediaPickerButton
                    label="Select / Upload video"
                    title="Reel video — media library"
                    folder="reels"
                    accept="video"
                    currentUrl={reelForm.videoSrc}
                    className="h-9 bg-slate-900 hover:bg-slate-800 text-white"
                    onSelect={(url) => {
                      setReelForm((p) => ({ ...p, videoSrc: url }))
                      toast.success('Reel video selected')
                    }}
                  />
                  {reelForm.videoSrc ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setReelForm((p) => ({ ...p, videoSrc: '' }))}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <Label>Video poster (optional)</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-12 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                      {reelForm.videoThumbnail ? (
                        <img
                          src={reelForm.videoThumbnail}
                          alt="Poster"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <MediaPickerButton
                      label="Select / Upload poster"
                      title="Reel video poster"
                      folder="reels"
                      accept="image"
                      currentUrl={reelForm.videoThumbnail || ''}
                      variant="outline"
                      className="h-8 text-xs"
                      onSelect={(url) => {
                        setReelForm((p) => ({ ...p, videoThumbnail: url }))
                        toast.success('Poster selected')
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Product column */}
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Reel product</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Name, pricing, stock, and product photo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reel-product-name">Product name *</Label>
                  <Input
                    id="reel-product-name"
                    value={reelForm.productName}
                    onChange={(e) => setReelForm((p) => ({ ...p, productName: e.target.value }))}
                    placeholder="Product shown in this reel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Price ({currencySymbol}) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={reelForm.price || ''}
                      onChange={(e) =>
                        setReelForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compare-at ({currencySymbol})</Label>
                    <Input
                      type="number"
                      min={0}
                      value={reelForm.originalPrice ?? ''}
                      onChange={(e) =>
                        setReelForm((p) => ({
                          ...p,
                          originalPrice: e.target.value ? parseFloat(e.target.value) : null,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reel-stock">Stock amount *</Label>
                    <Input
                      id="reel-stock"
                      type="number"
                      min={0}
                      step={1}
                      value={reelForm.stock}
                      onChange={(e) =>
                        setReelForm((p) => ({
                          ...p,
                          stock: normalizeStock(e.target.value, 0),
                        }))
                      }
                    />
                    <p className="text-[11px] text-slate-400">
                      {inStockFromQuantity(reelForm.stock)
                        ? `${reelForm.stock} units available`
                        : 'Out of stock'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort order</Label>
                    <Input
                      type="number"
                      value={reelForm.sortOrder}
                      onChange={(e) =>
                        setReelForm((p) => ({
                          ...p,
                          sortOrder: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product image *</Label>
                  <div className="flex items-start gap-3">
                    <div className="relative h-28 w-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                      {reelForm.thumbnail ? (
                        <img
                          src={reelForm.thumbnail}
                          alt="Product"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-1">
                          <ImageIcon className="h-6 w-6 opacity-40" />
                          <span className="text-[10px]">Required</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <MediaPickerButton
                        label="Select / Upload image"
                        title="Reel product image"
                        folder="reels"
                        accept="image"
                        currentUrl={reelForm.thumbnail}
                        className="h-9 bg-slate-900 hover:bg-slate-800 text-white"
                        onSelect={(url) => {
                          setReelForm((p) => ({ ...p, thumbnail: url }))
                          toast.success('Product image selected')
                        }}
                      />
                      {reelForm.thumbnail ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setReelForm((p) => ({ ...p, thumbnail: '' }))}
                        >
                          Remove
                        </Button>
                      ) : null}
                      <p className="text-[11px] text-slate-400 max-w-[180px]">
                        Square product photo shown with the reel
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color / product image variants */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Product color images</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Optional — add color photos shoppers can browse with this reel
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addReelColorVariant}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add color
                </Button>
              </div>
              <div className="p-4 space-y-3 bg-slate-50/40">
                {reelColorVariants.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    No color images yet. Add colors if this reel product has multiple variants.
                  </div>
                ) : (
                  reelColorVariants.map((variant, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-[88px_1fr_auto] gap-3 items-start rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="relative aspect-square w-[88px] rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                        {variant.image ? (
                          <img
                            src={variant.image}
                            alt={variant.name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                          <Input
                            value={variant.name}
                            onChange={(e) =>
                              setReelColorVariants((prev) =>
                                prev.map((v, i) =>
                                  i === index ? { ...v, name: e.target.value } : v
                                )
                              )
                            }
                            placeholder="Color name"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(variant.hex)
                                  ? variant.hex
                                  : '#888888'
                              }
                              onChange={(e) =>
                                setReelColorVariants((prev) =>
                                  prev.map((v, i) =>
                                    i === index ? { ...v, hex: e.target.value } : v
                                  )
                                )
                              }
                              className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
                            />
                            <Input
                              value={variant.hex}
                              onChange={(e) =>
                                setReelColorVariants((prev) =>
                                  prev.map((v, i) =>
                                    i === index ? { ...v, hex: e.target.value } : v
                                  )
                                )
                              }
                              className="w-[100px]"
                              placeholder="#1a1a1a"
                            />
                          </div>
                        </div>
                        <MediaPickerButton
                          label="Select / Upload color image"
                          title={`Reel color — ${variant.name || 'image'}`}
                          folder="reels"
                          accept="image"
                          currentUrl={variant.image}
                          variant="outline"
                          className="h-8 text-xs w-fit"
                          onSelect={(url) => {
                            setReelColorVariants((prev) =>
                              prev.map((v, i) => (i === index ? { ...v, image: url } : v))
                            )
                            toast.success('Color image selected')
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 shrink-0"
                        onClick={() => removeReelColorVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/80">
            <Button
              variant="outline"
              onClick={() => setReelDialogOpen(false)}
              disabled={savingReel}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSaveReel()}
              disabled={savingReel}
              className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]"
            >
              {savingReel ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingReel ? 'Update reel' : 'Publish reel'}
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
      { label: `Total Revenue (${currencySymbol})`, value: formatMoney(totalRevenue), icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
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

        {/* Products by Category Chart */}
        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Products by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByCategory.map((cat) => {
                const maxProducts = Math.max(...revenueByCategory.map(c => c.products), 1)
                const widthPct = (cat.products / maxProducts) * 100
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-24 shrink-0 truncate">{cat.name}</span>
                    <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
                      <div
                        className="h-full bg-amber-600 rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(widthPct, 8)}%` }}
                      >
                        <span className="text-xs font-medium text-white">{cat.products}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
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
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{order.customerName}</p>
                            <p className="text-xs text-slate-500">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {currencySymbol}{order.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-slate-800">
                              {paymentMethodLabel(order.paymentMethod)}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {paymentStatusLabel(order.paymentStatus)}
                              {order.paymentStatus !== 'paid' && order.status !== 'cancelled'
                                ? ` · Due ${currencySymbol}${order.totalAmount.toLocaleString()}`
                                : ''}
                            </p>
                          </div>
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

  function ProductEditor() {
    return (
      <div className="space-y-5 max-w-6xl">
        {/* Top bar — WooCommerce style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm py-3 -mt-1 border-b border-slate-200/80">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={closeProductEditor} className="shrink-0 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Products
            </Button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                {editingProduct ? 'Edit product' : 'Add new product'}
              </h2>
              <p className="text-xs text-slate-500">
                {editingProduct ? `Editing “${editingProduct.name}”` : 'Create a product like WooCommerce — upload images, set price & publish'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={closeProductEditor} disabled={savingProduct}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={savingProduct}
              className="bg-[#7F54B3] hover:bg-[#6d47a0] text-white shadow-sm"
            >
              {savingProduct ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingProduct ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* Title */}
        <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <Label htmlFor="product-name" className="text-slate-600 text-xs uppercase tracking-wider font-semibold">
              Product name
            </Label>
            <Input
              id="product-name"
              value={productForm.name}
              onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Product name"
              className="h-12 text-lg font-medium border-slate-200 focus-visible:ring-[#7F54B3]/30"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
          {/* Main column */}
          <div className="space-y-5 min-w-0">
            {/* Description */}
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white">
                <h3 className="text-sm font-semibold text-slate-900">Product description</h3>
              </div>
              <CardContent className="p-4 sm:p-5">
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Write a detailed product description…"
                  rows={6}
                  className="min-h-[140px] border-slate-200 resize-y"
                />
              </CardContent>
            </Card>

            {/* Product data */}
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white">
                <h3 className="text-sm font-semibold text-slate-900">Product data</h3>
                <p className="text-xs text-slate-500 mt-0.5">General pricing & details</p>
              </div>
              <CardContent className="p-4 sm:p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price ({currencySymbol}) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={productForm.price || ''}
                      onChange={(e) =>
                        setProductForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compare-at price ({currencySymbol})</Label>
                    <Input
                      type="number"
                      min={0}
                      value={productForm.originalPrice ?? ''}
                      onChange={(e) =>
                        setProductForm((p) => ({
                          ...p,
                          originalPrice: e.target.value ? parseFloat(e.target.value) : null,
                        }))
                      }
                      placeholder="Optional higher price"
                    />
                    <p className="text-[11px] text-slate-400">Shown as struck-through original price on storefront</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <Input
                    value={productForm.features}
                    onChange={(e) => setProductForm((p) => ({ ...p, features: e.target.value }))}
                    placeholder="Feature 1 | Feature 2 | Feature 3"
                  />
                  <p className="text-[11px] text-slate-400">Separate features with a pipe (|)</p>
                </div>
              </CardContent>
            </Card>

            {/* Featured image */}
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white">
                <h3 className="text-sm font-semibold text-slate-900">Featured image</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Main catalog image · Recommended 1200 × 1200 px · Max 5MB
                </p>
              </div>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative w-full sm:w-44 aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="Featured"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      className="h-9 bg-slate-900 hover:bg-slate-800 text-white"
                      onClick={() => setMediaPicker('primary')}
                    >
                      <Images className="h-3.5 w-3.5 mr-1.5" />
                      Select / Upload image
                    </Button>
                    {productForm.image ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setProductForm((p) => ({ ...p, image: '' }))}
                      >
                        Remove
                      </Button>
                    ) : null}
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Open the media library to pick an existing image or upload a new one
                      (WordPress-style).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color gallery — multiple images linked to swatches */}
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Color gallery</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload an image per color — homepage swatches will swap to that image
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addColorVariant}
                  className="shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add color
                </Button>
              </div>
              <CardContent className="p-4 sm:p-5 space-y-4">
                {colorVariants.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No color images yet. Click <span className="font-medium text-slate-700">Add color</span> and
                    upload a photo for each swatch.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colorVariants.map((variant, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-[96px_1fr_auto] gap-3 items-start rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="relative aspect-square w-24 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                          {variant.image ? (
                            <img
                              src={variant.image}
                              alt={variant.name}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 min-w-0">
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                            <Input
                              value={variant.name}
                              onChange={(e) =>
                                setColorVariants((prev) =>
                                  prev.map((v, i) =>
                                    i === index ? { ...v, name: e.target.value } : v
                                  )
                                )
                              }
                              placeholder="Color name (e.g. Black)"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(variant.swatch) ? variant.swatch : '#888888'}
                                onChange={(e) =>
                                  setColorVariants((prev) =>
                                    prev.map((v, i) =>
                                      i === index ? { ...v, swatch: e.target.value } : v
                                    )
                                  )
                                }
                                className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
                                title="Swatch color"
                              />
                              <Input
                                value={variant.swatch}
                                onChange={(e) =>
                                  setColorVariants((prev) =>
                                    prev.map((v, i) =>
                                      i === index ? { ...v, swatch: e.target.value } : v
                                    )
                                  )
                                }
                                placeholder="#1a1a1a"
                                className="w-[110px]"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => setMediaPicker(index)}
                            >
                              <Images className="h-3 w-3 mr-1" />
                              Select / Upload
                            </Button>
                            {variant.image ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() =>
                                  setColorVariants((prev) =>
                                    prev.map((v, i) => (i === index ? { ...v, image: '' } : v))
                                  )
                                }
                              >
                                Clear image
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 shrink-0"
                          onClick={() => removeColorVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 xl:sticky xl:top-24">
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
              <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-[#7F54B3]/10 to-transparent">
                <h3 className="text-sm font-semibold text-slate-900">Publish</h3>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Stock quantity</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min={0}
                    step={1}
                    value={productForm.stock}
                    onChange={(e) => {
                      const stock = normalizeStock(e.target.value, 0)
                      setProductForm((p) => ({
                        ...p,
                        stock,
                        inStock: inStockFromQuantity(stock),
                      }))
                    }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400">
                      Units available for sale
                    </p>
                    <Badge
                      variant={inStockFromQuantity(productForm.stock) ? 'default' : 'destructive'}
                      className="text-[10px]"
                    >
                      {inStockFromQuantity(productForm.stock)
                        ? `${productForm.stock} in stock`
                        : 'Out of stock'}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Flash delivery</p>
                    <p className="text-[11px] text-slate-400">Highlight quick shipping</p>
                  </div>
                  <Switch
                    checked={productForm.hasFlash}
                    onCheckedChange={(v) => setProductForm((p) => ({ ...p, hasFlash: v }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      New Arrivals
                    </p>
                    <p className="text-[11px] text-slate-400">Show in New Arrivals shop</p>
                  </div>
                  <Switch
                    checked={productForm.isNewArrival}
                    onCheckedChange={(v) =>
                      setProductForm((p) => ({ ...p, isNewArrival: v, hasFlash: v || p.hasFlash }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-rose-600" />
                      Prime Drop
                    </p>
                    <p className="text-[11px] text-slate-400">Show in Prime Drop shop</p>
                  </div>
                  <Switch
                    checked={productForm.isPrimeDrop}
                    onCheckedChange={(v) =>
                      setProductForm((p) => ({ ...p, isPrimeDrop: v }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Featured</p>
                    <p className="text-[11px] text-slate-400">
                      New In Trend homepage tab (not Prime Bags/Shoes)
                    </p>
                  </div>
                  <Switch
                    checked={productForm.isFeatured}
                    onCheckedChange={(v) =>
                      setProductForm((p) => ({ ...p, isFeatured: v }))
                    }
                  />
                </div>
                <Separator />
                <Button
                  onClick={handleSaveProduct}
                  disabled={savingProduct}
                  className="w-full bg-[#7F54B3] hover:bg-[#6d47a0] text-white"
                >
                  {savingProduct ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingProduct ? 'Update product' : 'Publish product'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={closeProductEditor} disabled={savingProduct}>
                  Cancel
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Product organization</h3>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={productForm.category}
                    onValueChange={(v) =>
                      setProductForm((p) => ({ ...p, category: v, subCategory: null }))
                    }
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
                <div className="space-y-2">
                  <Label>Subcategory slug</Label>
                  <Input
                    value={productForm.subCategory || ''}
                    onChange={(e) =>
                      setProductForm((p) => ({
                        ...p,
                        subCategory: e.target.value.trim() || null,
                      }))
                    }
                    placeholder="e.g. shoulder-bag"
                    className="font-mono text-sm"
                  />
                  <p className="text-[11px] text-slate-400">
                    Must match a subcategory under Categories
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Select
                    value={productForm.badge || '__none__'}
                    onValueChange={(v) =>
                      setProductForm((p) => ({ ...p, badge: v === '__none__' ? null : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {badgeOptions.map((opt) => (
                        <SelectItem key={opt.value || '__none__'} value={opt.value || '__none__'}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Homepage collection</Label>
                  <Select
                    value={productForm.collection || '__none__'}
                    onValueChange={(v) =>
                      setProductForm((p) => ({
                        ...p,
                        collection: v === '__none__' ? null : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionOptions.map((opt) => (
                        <SelectItem key={opt.value || '__none__'} value={opt.value || '__none__'}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400">
                    Assign to Prime Bags or Prime Shoes carousel on the homepage
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  function ProductsPage() {
    if (productEditorOpen) {
      return ProductEditor()
    }

    const currentPage = Math.min(productPage, productTotalPages)
    const from = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1
    const to = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Products</h2>
            <p className="text-slate-500 text-sm mt-1">
              {filteredProducts.length} of {products.length} products
              {productSearch.trim() ? ' matching search' : ''}
            </p>
          </div>
          <Button
            onClick={openCreateProduct}
            className="bg-[#7F54B3] hover:bg-[#6d47a0] text-white rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add product
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search by name, category, or badge..."
            className="pl-9"
          />
        </div>

        <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden p-0 gap-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price ({currencySymbol})</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-slate-50/60">
                        <TableCell>
                          <div className={`${productThumbClass} w-11 rounded-lg border border-slate-100`}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <button
                              type="button"
                              onClick={() => openEditProduct(product)}
                              className="font-medium text-slate-900 line-clamp-1 text-left hover:text-[#7F54B3] transition-colors"
                            >
                              {product.name}
                            </button>
                            {product.badge && (
                              <Badge variant="secondary" className="text-[10px] mt-0.5">
                                {product.badge}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-slate-600">{product.category}</TableCell>
                        <TableCell className="font-medium">{currencySymbol}{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          {(() => {
                            const qty =
                              typeof product.stock === 'number'
                                ? product.stock
                                : product.inStock
                                  ? 100
                                  : 0
                            const available = qty > 0
                            return (
                              <div className="flex flex-col items-start gap-1">
                                <span
                                  className={`text-sm font-semibold tabular-nums ${
                                    available ? 'text-slate-900' : 'text-red-600'
                                  }`}
                                >
                                  {qty}
                                </span>
                                <Badge
                                  variant={available ? 'secondary' : 'destructive'}
                                  className="text-[10px] font-normal"
                                >
                                  {available ? 'In stock' : 'Out'}
                                </Badge>
                              </div>
                            )
                          })()}
                        </TableCell>
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

            {filteredProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Showing {from}–{to} of {filteredProducts.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <span className="text-sm font-medium text-slate-700 tabular-nums px-2">
                    {currentPage} / {productTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= productTotalPages}
                    onClick={() => setProductPage((p) => Math.min(productTotalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Reels Page ────────────────────────────────────────────────────────────

  function ReelsPage() {
    const currentPage = Math.min(reelPage, reelTotalPages)
    const from = filteredReels.length === 0 ? 0 : (currentPage - 1) * REELS_PER_PAGE + 1
    const to = Math.min(currentPage * REELS_PER_PAGE, filteredReels.length)

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Reels</h2>
            <p className="text-slate-500 text-sm mt-1">
              {filteredReels.length} of {reels.length} reels
              {reelSearch.trim() || reelStatusFilter !== 'all' ? ' matching filters' : ''}
            </p>
          </div>
          <Button
            onClick={openCreateReel}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Reel
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={reelSearch}
              onChange={(e) => setReelSearch(e.target.value)}
              placeholder="Search by title, product name, or price..."
              className="pl-9"
            />
          </div>
          <Select
            value={reelStatusFilter}
            onValueChange={(v) =>
              setReelStatusFilter(v === 'active' || v === 'inactive' ? v : 'all')
            }
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-xl border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumb</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price ({currencySymbol})</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        {reels.length === 0
                          ? 'No reels yet. Create your first reel!'
                          : 'No reels match your search'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReels.map((reel) => (
                      <TableRow key={reel.id}>
                        <TableCell>
                          <div className={`${productThumbClass} w-12 rounded-lg`}>
                            <img
                              src={reel.videoThumbnail || reel.thumbnail}
                              alt={reel.title}
                              className="absolute inset-0 h-full w-full object-fill"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-slate-900 line-clamp-1">{reel.title}</p>
                        </TableCell>
                        <TableCell className="text-slate-600 line-clamp-1 max-w-[180px]">
                          {reel.productName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {currencySymbol}{reel.price.toLocaleString()}
                            </span>
                            {reel.originalPrice != null && (
                              <span className="text-xs text-slate-400 line-through">
                                {currencySymbol}{reel.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              (reel.stock ?? 0) > 0 ? 'text-slate-900' : 'text-red-600'
                            }`}
                          >
                            {typeof reel.stock === 'number' ? reel.stock : 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              reel.isActive
                                ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                                : 'bg-slate-500 text-white hover:bg-slate-500'
                            }`}
                          >
                            {reel.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">#{reel.sortOrder}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditReel(reel)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => openDeleteDialog('reel', reel.id)}
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

            {filteredReels.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Showing {from}–{to} of {filteredReels.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setReelPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <span className="text-sm font-medium text-slate-700 tabular-nums px-2">
                    {currentPage} / {reelTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= reelTotalPages}
                    onClick={() => setReelPage((p) => Math.min(reelTotalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
                    <TableHead>Total ({currencySymbol})</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <Fragment key={order.id}>
                        <TableRow>
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
                            {order.id}
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
                            {currencySymbol}{order.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 min-w-[8.5rem]">
                              <p className="text-xs font-semibold text-slate-800">
                                {paymentMethodLabel(order.paymentMethod)}
                              </p>
                              <Badge
                                className={`text-[10px] ${
                                  paymentStatusColors[order.paymentStatus || 'unpaid'] ||
                                  'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {paymentStatusLabel(order.paymentStatus)}
                              </Badge>
                              {order.paymentStatus !== 'paid' && order.status !== 'cancelled' ? (
                                <p className="text-[10px] font-medium text-orange-600">
                                  Due {currencySymbol}
                                  {order.totalAmount.toLocaleString()}
                                </p>
                              ) : order.paymentStatus === 'paid' ? (
                                <p className="text-[10px] text-emerald-600">Fully paid</p>
                              ) : null}
                            </div>
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
                            <div className="inline-flex items-center justify-end gap-2">
                              <Select
                                value={draftOrderStatuses[order.id] ?? order.status}
                                onValueChange={(value) =>
                                  setDraftOrderStatuses((prev) => ({
                                    ...prev,
                                    [order.id]: value,
                                  }))
                                }
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
                              {(draftOrderStatuses[order.id] ?? order.status) !==
                                order.status && (
                                <Button
                                  size="sm"
                                  className="h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3"
                                  disabled={savingOrderId === order.id}
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      draftOrderStatuses[order.id] ?? order.status
                                    )
                                  }
                                >
                                  {savingOrderId === order.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Save className="h-3.5 w-3.5 mr-1" />
                                      Save
                                    </>
                                  )}
                                </Button>
                              )}
                              {order.paymentMethod === PAYMENT_METHODS.COD &&
                                order.paymentStatus !== PAYMENT_STATUS.PAID &&
                                order.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg px-2.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                  title="Cash received"
                                  disabled={savingOrderId === order.id}
                                  onClick={() => void handleCashReceived(order.id)}
                                >
                                  {savingOrderId === order.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Banknote className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}
                              {order.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg px-2.5"
                                  title="View invoice"
                                  onClick={() => setInvoiceOrder(order)}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                title="Delete order"
                                onClick={() => openDeleteDialog('order', order.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedOrder === order.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-slate-50/50 px-8 py-4">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-slate-700">Order Items</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {order.paymentMethod === PAYMENT_METHODS.COD &&
                                      order.paymentStatus !== PAYMENT_STATUS.PAID &&
                                      order.status !== 'cancelled' && (
                                      <Button
                                        size="sm"
                                        className="rounded-lg h-8 bg-emerald-700 hover:bg-emerald-800 text-white"
                                        disabled={savingOrderId === order.id}
                                        onClick={() => void handleCashReceived(order.id)}
                                      >
                                        {savingOrderId === order.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                        ) : (
                                          <Banknote className="h-3.5 w-3.5 mr-1.5" />
                                        )}
                                        Cash received
                                      </Button>
                                    )}
                                    {order.status !== 'cancelled' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg h-8"
                                        onClick={() => setInvoiceOrder(order)}
                                      >
                                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                                        Invoice
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-slate-600">
                                      {item.productName} × {item.quantity}
                                    </span>
                                    <span className="font-medium text-slate-900">
                                      {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                                {(order.shippingAddress || order.city) && (
                                  <>
                                    <Separator />
                                    <div className="text-sm text-slate-600">
                                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                                        Shipping
                                      </p>
                                      <p>
                                        {[
                                          order.shippingAddress,
                                          [order.city, order.state].filter(Boolean).join(', '),
                                          order.zipCode,
                                        ]
                                          .filter(Boolean)
                                          .join(' · ')}
                                      </p>
                                    </div>
                                  </>
                                )}
                                <Separator />
                                <div className="text-sm text-slate-600 space-y-1">
                                  <p className="text-xs uppercase tracking-wider text-slate-400">
                                    Payment
                                  </p>
                                  <p>
                                    <span className="font-medium text-slate-800">
                                      {paymentMethodLabel(order.paymentMethod)}
                                    </span>
                                    {' · '}
                                    {paymentStatusLabel(order.paymentStatus)}
                                  </p>
                                  {order.paymentStatus === 'paid' ? (
                                    <p className="text-xs text-emerald-600">
                                      Fully paid
                                      {order.paidAt
                                        ? ` · ${new Date(order.paidAt).toLocaleString()}`
                                        : ''}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-orange-600 font-medium">
                                      Balance due: {currencySymbol}
                                      {order.totalAmount.toLocaleString()}
                                      {order.paymentMethod === PAYMENT_METHODS.COD
                                        ? ' · collect when delivered'
                                        : ''}
                                    </p>
                                  )}
                                  {order.transactionId ? (
                                    <p className="font-mono text-xs text-slate-500">
                                      Tran ID: {order.transactionId}
                                    </p>
                                  ) : null}
                                  {order.sslBankTranId ? (
                                    <p className="font-mono text-xs text-slate-500">
                                      Bank tran: {order.sslBankTranId}
                                    </p>
                                  ) : null}
                                  {order.sslCardType ? (
                                    <p className="text-xs text-slate-500">Via: {order.sslCardType}</p>
                                  ) : null}
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm font-semibold">
                                  <span>Total</span>
                                  <span>{currencySymbol}{order.totalAmount.toLocaleString()}</span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
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

  // ─── Settings Page ─────────────────────────────────────────────────────────

  function SettingsPage() {
    const [logoUrl, setLogoUrl] = useState('')
    const [logoWidth, setLogoWidth] = useState(36)
    const [logoHeight, setLogoHeight] = useState(36)
    const [widthInput, setWidthInput] = useState('36')
    const [heightInput, setHeightInput] = useState('36')
    const [uploading, setUploading] = useState(false)
    const [savingSize, setSavingSize] = useState(false)
    const [loadingLogo, setLoadingLogo] = useState(true)

    const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>('image')
    const [heroMediaUrl, setHeroMediaUrl] = useState('')
    const [uploadingHero, setUploadingHero] = useState(false)
    const [selectedCurrency, setSelectedCurrency] = useState(currencyCode || DEFAULT_CURRENCY_CODE)
    const [savingCurrency, setSavingCurrency] = useState(false)
    const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP_NUMBER)
    const [whatsappIconId, setWhatsappIconId] = useState<WhatsAppIconId>(DEFAULT_WHATSAPP_ICON_ID)
    const [whatsappIconUrl, setWhatsappIconUrl] = useState(DEFAULT_WHATSAPP_ICON_URL)
    const [uploadingWhatsappIcon, setUploadingWhatsappIcon] = useState(false)
    const [freeDeliveryMin, setFreeDeliveryMin] = useState(String(DEFAULT_FREE_DELIVERY_MIN))
    const [deliveryCharge, setDeliveryCharge] = useState(String(DEFAULT_DELIVERY_CHARGE))
    const [facebookUrl, setFacebookUrl] = useState(DEFAULT_FACEBOOK_URL)
    const [instagramUrl, setInstagramUrl] = useState(DEFAULT_INSTAGRAM_URL)
    const [tiktokUrl, setTiktokUrl] = useState(DEFAULT_TIKTOK_URL)
    const [savingCommerce, setSavingCommerce] = useState(false)

    const [invoiceEmail, setInvoiceEmail] = useState<InvoiceEmailSettings>(DEFAULT_INVOICE_EMAIL)
    const [savingInvoiceEmail, setSavingInvoiceEmail] = useState(false)
    const [testEmailTo, setTestEmailTo] = useState('')
    const [sendingTestEmail, setSendingTestEmail] = useState(false)

    const [maintenance, setMaintenance] = useState<MaintenanceSettings>(DEFAULT_MAINTENANCE)
    const [savingMaintenance, setSavingMaintenance] = useState(false)

    const broadcastBranding = (next: {
      logoUrl?: string
      logoWidth?: number
      logoHeight?: number
      heroMediaType?: 'image' | 'video'
      heroMediaUrl?: string
      currencyCode?: string
    }) => {
      window.dispatchEvent(new CustomEvent('site-logo-updated', { detail: next }))
      window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: next }))
      if (next.currencyCode) broadcastCurrency(next.currencyCode)
    }

    const syncDims = (width: number, height: number) => {
      setLogoWidth(width)
      setLogoHeight(height)
      setWidthInput(String(width))
      setHeightInput(String(height))
    }

    useEffect(() => {
      fetch('/api/settings', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (typeof data?.logoUrl === 'string') setLogoUrl(data.logoUrl)
          const w =
            typeof data?.logoWidth === 'number'
              ? data.logoWidth
              : typeof data?.logoSize === 'number'
                ? data.logoSize
                : 36
          const h =
            typeof data?.logoHeight === 'number'
              ? data.logoHeight
              : typeof data?.logoSize === 'number'
                ? data.logoSize
                : 36
          syncDims(w, h)
          if (data?.heroMediaType === 'video' || data?.heroMediaType === 'image') {
            setHeroMediaType(data.heroMediaType)
          }
          if (typeof data?.heroMediaUrl === 'string') setHeroMediaUrl(data.heroMediaUrl)
          if (typeof data?.currencyCode === 'string' && data.currencyCode) {
            setSelectedCurrency(data.currencyCode)
          }
          if (typeof data?.whatsappNumber === 'string') {
            setWhatsappNumber(data.whatsappNumber || DEFAULT_WHATSAPP_NUMBER)
          }
          if (data?.whatsappIconId) {
            setWhatsappIconId(data.whatsappIconId as WhatsAppIconId)
          }
          if (typeof data?.whatsappIconUrl === 'string') {
            setWhatsappIconUrl(data.whatsappIconUrl)
          }
          if (data?.freeDeliveryMin !== undefined && data?.freeDeliveryMin !== null) {
            setFreeDeliveryMin(String(data.freeDeliveryMin))
          }
          if (data?.deliveryCharge !== undefined && data?.deliveryCharge !== null) {
            setDeliveryCharge(String(data.deliveryCharge))
          }
          if (typeof data?.facebookUrl === 'string') {
            setFacebookUrl(data.facebookUrl)
          }
          if (typeof data?.instagramUrl === 'string') {
            setInstagramUrl(data.instagramUrl)
          }
          if (typeof data?.tiktokUrl === 'string') {
            setTiktokUrl(data.tiktokUrl)
          }
          if (data?.invoiceEmail) {
            setInvoiceEmail(normalizeInvoiceEmailSettings(data.invoiceEmail))
          }
          if (data?.maintenance) {
            setMaintenance(normalizeMaintenanceSettings(data.maintenance))
          }
        })
        .catch(() => undefined)
        .finally(() => setLoadingLogo(false))
    }, [])

    const handleSaveMaintenance = async (next?: MaintenanceSettings) => {
      const payload = normalizeMaintenanceSettings(next ?? maintenance)
      setSavingMaintenance(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maintenance: payload }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not save maintenance settings')
          return
        }
        const saved = normalizeMaintenanceSettings(data.maintenance)
        setMaintenance(saved)
        broadcastMaintenance(saved)
        toast.success(
          saved.enabled
            ? 'Maintenance mode is ON — storefront shows the maintenance page'
            : 'Maintenance mode is OFF — storefront is live'
        )
      } catch {
        toast.error('Could not save maintenance settings')
      } finally {
        setSavingMaintenance(false)
      }
    }

    const handleSaveInvoiceEmail = async () => {
      setSavingInvoiceEmail(true)
      try {
        const payload = normalizeInvoiceEmailSettings(invoiceEmail)
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceEmail: payload }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not save email template')
          return
        }
        setInvoiceEmail(normalizeInvoiceEmailSettings(data.invoiceEmail))
        toast.success('Invoice email settings saved')
      } catch {
        toast.error('Could not save email template')
      } finally {
        setSavingInvoiceEmail(false)
      }
    }

    const handleTestInvoiceEmail = async () => {
      const to = testEmailTo.trim()
      if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        toast.error('Enter a valid email address for the test send')
        return
      }
      setSendingTestEmail(true)
      try {
        const res = await fetch('/api/settings/invoice-email/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            invoiceEmail: normalizeInvoiceEmailSettings(invoiceEmail),
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Test email failed')
          return
        }
        toast.success(data.message || `Test email sent to ${to}`)
      } catch {
        toast.error('Test email failed')
      } finally {
        setSendingTestEmail(false)
      }
    }

    const handleSaveCurrency = async (code: string) => {
      setSelectedCurrency(code)
      setSavingCurrency(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currencyCode: code }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not save currency')
          return
        }
        const nextCode = data.currencyCode || code
        setSelectedCurrency(nextCode)
        broadcastCurrency(nextCode)
        toast.success(`Currency updated to ${currencyLabel(CURRENCIES.find(c => c.code === nextCode) || CURRENCIES[0])}`)
      } catch {
        toast.error('Could not save currency')
      } finally {
        setSavingCurrency(false)
      }
    }

    const handleSaveCommerce = async () => {
      setSavingCommerce(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            whatsappNumber,
            whatsappIconId,
            whatsappIconUrl,
            freeDeliveryMin: Number(freeDeliveryMin),
            deliveryCharge: Number(deliveryCharge),
            facebookUrl,
            instagramUrl,
            tiktokUrl,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not save store contact & delivery')
          return
        }
        const nextWhatsapp = data.whatsappNumber || DEFAULT_WHATSAPP_NUMBER
        const nextIconId = (data.whatsappIconId || DEFAULT_WHATSAPP_ICON_ID) as WhatsAppIconId
        const nextIconUrl =
          typeof data.whatsappIconUrl === 'string' ? data.whatsappIconUrl : DEFAULT_WHATSAPP_ICON_URL
        const nextFreeMin =
          typeof data.freeDeliveryMin === 'number' ? data.freeDeliveryMin : DEFAULT_FREE_DELIVERY_MIN
        const nextCharge =
          typeof data.deliveryCharge === 'number' ? data.deliveryCharge : DEFAULT_DELIVERY_CHARGE
        const nextFacebook =
          typeof data.facebookUrl === 'string' ? data.facebookUrl : DEFAULT_FACEBOOK_URL
        const nextInstagram =
          typeof data.instagramUrl === 'string' ? data.instagramUrl : DEFAULT_INSTAGRAM_URL
        const nextTiktok =
          typeof data.tiktokUrl === 'string' ? data.tiktokUrl : DEFAULT_TIKTOK_URL
        setWhatsappNumber(nextWhatsapp)
        setWhatsappIconId(nextIconId)
        setWhatsappIconUrl(nextIconUrl)
        setFreeDeliveryMin(String(nextFreeMin))
        setDeliveryCharge(String(nextCharge))
        setFacebookUrl(nextFacebook)
        setInstagramUrl(nextInstagram)
        setTiktokUrl(nextTiktok)
        broadcastStoreSettings({
          whatsappNumber: nextWhatsapp,
          whatsappIconId: nextIconId,
          whatsappIconUrl: nextIconUrl,
          freeDeliveryMin: nextFreeMin,
          deliveryCharge: nextCharge,
          facebookUrl: nextFacebook,
          instagramUrl: nextInstagram,
          tiktokUrl: nextTiktok,
        })
        toast.success('Store contact, social & delivery settings saved')
      } catch {
        toast.error('Could not save store contact & delivery')
      } finally {
        setSavingCommerce(false)
      }
    }

    const handleSelectWhatsappIcon = async (id: WhatsAppIconId) => {
      if (id === 'custom' && !whatsappIconUrl) return
      setWhatsappIconId(id)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            whatsappIconId: id,
            ...(id === 'custom' ? { whatsappIconUrl } : {}),
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not update icon')
          return
        }
        const nextId = (data.whatsappIconId || id) as WhatsAppIconId
        const nextUrl =
          typeof data.whatsappIconUrl === 'string' ? data.whatsappIconUrl : whatsappIconUrl
        setWhatsappIconId(nextId)
        setWhatsappIconUrl(nextUrl)
        broadcastStoreSettings({
          whatsappIconId: nextId,
          whatsappIconUrl: nextUrl,
        })
      } catch {
        toast.error('Could not update icon')
      }
    }

    const handleWhatsappIconSelect = async (url: string) => {
      setUploadingWhatsappIcon(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            whatsappIconId: 'custom',
            whatsappIconUrl: url,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not save icon')
          return
        }
        const nextId = (data.whatsappIconId || 'custom') as WhatsAppIconId
        const nextUrl = data.whatsappIconUrl || url
        setWhatsappIconId(nextId)
        setWhatsappIconUrl(nextUrl)
        broadcastStoreSettings({
          whatsappIconId: nextId,
          whatsappIconUrl: nextUrl,
        })
        toast.success('Custom WhatsApp icon saved')
      } catch {
        toast.error('Could not save icon')
      } finally {
        setUploadingWhatsappIcon(false)
      }
    }

    const handleResetWhatsappIcon = async () => {
      setUploadingWhatsappIcon(true)
      try {
        const res = await fetch('/api/settings/whatsapp-icon', { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not reset icon')
          return
        }
        setWhatsappIconId(DEFAULT_WHATSAPP_ICON_ID)
        setWhatsappIconUrl(DEFAULT_WHATSAPP_ICON_URL)
        broadcastStoreSettings({
          whatsappIconId: DEFAULT_WHATSAPP_ICON_ID,
          whatsappIconUrl: DEFAULT_WHATSAPP_ICON_URL,
        })
        toast.success('WhatsApp icon reset to classic')
      } catch {
        toast.error('Could not reset icon')
      } finally {
        setUploadingWhatsappIcon(false)
      }
    }

    const handleLogoSelect = async (url: string) => {
      setUploading(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl: url }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not save logo')
          return
        }
        setLogoUrl(data.logoUrl || url)
        if (typeof data.logoWidth === 'number' && typeof data.logoHeight === 'number') {
          syncDims(data.logoWidth, data.logoHeight)
        }
        broadcastBranding({
          logoUrl: data.logoUrl || url,
          logoWidth: data.logoWidth ?? logoWidth,
          logoHeight: data.logoHeight ?? logoHeight,
        })
        toast.success('Logo updated — browser tab icon refreshed')
      } catch {
        toast.error('Could not save logo')
      } finally {
        setUploading(false)
      }
    }

    const handleReset = async () => {
      setUploading(true)
      try {
        const res = await fetch('/api/settings/logo', { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Reset failed')
          return
        }
        setLogoUrl(data.logoUrl)
        if (typeof data.logoWidth === 'number' && typeof data.logoHeight === 'number') {
          syncDims(data.logoWidth, data.logoHeight)
        }
        broadcastBranding({
          logoUrl: data.logoUrl,
          logoWidth: data.logoWidth ?? logoWidth,
          logoHeight: data.logoHeight ?? logoHeight,
        })
        toast.success('Logo cleared')
      } catch {
        toast.error('Clear failed')
      } finally {
        setUploading(false)
      }
    }

    const parseDim = (value: string, fallback: number) => {
      const parsed = Number(value.trim())
      if (!Number.isFinite(parsed) || value.trim() === '') return null
      return Math.min(200, Math.max(16, Math.round(parsed)))
    }

    const handleSaveSize = async () => {
      const nextWidth = parseDim(widthInput, logoWidth)
      const nextHeight = parseDim(heightInput, logoHeight)

      if (nextWidth === null || nextHeight === null) {
        toast.error('Enter valid width and height (16–200)')
        setWidthInput(String(logoWidth))
        setHeightInput(String(logoHeight))
        return
      }

      setSavingSize(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logoWidth: nextWidth,
            logoHeight: nextHeight,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Failed to save size')
          return
        }
        syncDims(data.logoWidth, data.logoHeight)
        broadcastBranding({
          logoUrl: data.logoUrl,
          logoWidth: data.logoWidth,
          logoHeight: data.logoHeight,
        })
        toast.success(`Logo size saved (${data.logoWidth}×${data.logoHeight}px)`)
      } catch {
        toast.error('Failed to save size')
      } finally {
        setSavingSize(false)
      }
    }

    const handleHeroSelect = async (url: string, item?: MediaItem) => {
      const nextType = item?.kind === 'video' ? 'video' : 'image'
      setUploadingHero(true)
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            heroMediaUrl: url,
            heroMediaType: nextType,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Could not save hero media')
          return
        }
        const type =
          data.heroMediaType === 'video' || data.heroMediaType === 'image'
            ? data.heroMediaType
            : nextType
        const mediaUrl = typeof data.heroMediaUrl === 'string' ? data.heroMediaUrl : url
        setHeroMediaType(type)
        setHeroMediaUrl(mediaUrl)
        broadcastBranding({
          heroMediaType: type,
          heroMediaUrl: mediaUrl,
        })
        toast.success(`Hero ${type} saved`)
      } catch {
        toast.error('Could not save hero media')
      } finally {
        setUploadingHero(false)
      }
    }

    const handleHeroReset = async () => {
      setUploadingHero(true)
      try {
        const res = await fetch('/api/settings/hero', { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Reset failed')
          return
        }
        setHeroMediaType(data.heroMediaType)
        setHeroMediaUrl(data.heroMediaUrl)
        broadcastBranding({
          heroMediaType: data.heroMediaType,
          heroMediaUrl: data.heroMediaUrl,
        })
        toast.success('Hero media cleared')
      } catch {
        toast.error('Clear failed')
      } finally {
        setUploadingHero(false)
      }
    }

    const displayLogo = logoUrl
    const displayHero = heroMediaUrl

    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage maintenance mode, currency, invoice emails, WhatsApp, delivery, and branding
          </p>
        </div>

        <Card
          className={`rounded-xl border-slate-200 ${
            maintenance.enabled ? 'border-amber-300 bg-amber-50/40' : ''
          }`}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Construction className="h-5 w-5 text-amber-600" />
              Maintenance mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {maintenance.enabled ? 'Storefront is offline' : 'Storefront is live'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  When on, visitors see the maintenance template. Staff can still sign in at{' '}
                  <span className="font-medium">/login</span>, then open{' '}
                  <span className="font-medium">/admin</span>.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Switch
                  checked={maintenance.enabled}
                  disabled={savingMaintenance}
                  onCheckedChange={(v) => {
                    const next = { ...maintenance, enabled: v }
                    setMaintenance(next)
                    void handleSaveMaintenance(next)
                  }}
                />
                <span
                  className={`text-sm font-semibold ${
                    maintenance.enabled ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {maintenance.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maint-title">Headline</Label>
              <Input
                id="maint-title"
                value={maintenance.title}
                onChange={(e) =>
                  setMaintenance((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="We'll be back soon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maint-message">Message</Label>
              <Textarea
                id="maint-message"
                rows={4}
                value={maintenance.message}
                onChange={(e) =>
                  setMaintenance((prev) => ({ ...prev, message: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maint-eta">Expected return (optional)</Label>
              <Input
                id="maint-eta"
                value={maintenance.eta}
                onChange={(e) =>
                  setMaintenance((prev) => ({ ...prev, eta: e.target.value }))
                }
                placeholder="e.g. Tomorrow 10:00 AM"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleSaveMaintenance()}
                disabled={savingMaintenance}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {savingMaintenance ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save message
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={savingMaintenance}
                onClick={() =>
                  setMaintenance((prev) => ({
                    ...DEFAULT_MAINTENANCE,
                    enabled: prev.enabled,
                  }))
                }
              >
                Reset copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
              Store currency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Prices across the website, cart, checkout, invoices, and admin panels use this
              currency symbol.
            </p>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="currency-select">Currency</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(v) => void handleSaveCurrency(v)}
                disabled={savingCurrency}
              >
                <SelectTrigger id="currency-select" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {currencyLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex items-center gap-3">
              <span className="text-2xl font-semibold tabular-nums">
                {formatCurrencyAmount(1250, selectedCurrency)}
              </span>
              <span className="text-slate-500">Preview · 1,250 displayed as store price</span>
              {savingCurrency && <Loader2 className="h-4 w-4 animate-spin text-slate-400 ml-auto" />}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-sky-600" />
              Order invoice emails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-slate-500">
              Choose a layout, edit the copy, then save. Orders always complete even if email fails.
              Placeholders: {'{{orderId}}'}, {'{{customerName}}'}, {'{{total}}'},{' '}
              {'{{currencySymbol}}'}
            </p>

            <div className="space-y-2">
              <Label>Email template</Label>
              <Select
                value={invoiceEmail.templateId}
                onValueChange={(v) =>
                  setInvoiceEmail((prev) => ({
                    ...prev,
                    templateId: v as InvoiceEmailTemplateId,
                  }))
                }
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_EMAIL_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {
                  INVOICE_EMAIL_TEMPLATES.find((t) => t.id === invoiceEmail.templateId)
                    ?.description
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-email-subject">Subject</Label>
              <Input
                id="invoice-email-subject"
                value={invoiceEmail.subject}
                onChange={(e) =>
                  setInvoiceEmail((prev) => ({ ...prev, subject: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-email-greeting">Greeting</Label>
              <Input
                id="invoice-email-greeting"
                value={invoiceEmail.greeting}
                onChange={(e) =>
                  setInvoiceEmail((prev) => ({ ...prev, greeting: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-email-body">Body</Label>
              <Textarea
                id="invoice-email-body"
                rows={6}
                value={invoiceEmail.body}
                onChange={(e) =>
                  setInvoiceEmail((prev) => ({ ...prev, body: e.target.value }))
                }
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-email-footer">Footer</Label>
              <Input
                id="invoice-email-footer"
                value={invoiceEmail.footerText}
                onChange={(e) =>
                  setInvoiceEmail((prev) => ({ ...prev, footerText: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={invoiceEmail.attachPdf}
                onCheckedChange={(v) =>
                  setInvoiceEmail((prev) => ({ ...prev, attachPdf: v }))
                }
              />
              <Label>Attach invoice PDF</Label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleSaveInvoiceEmail()}
                disabled={savingInvoiceEmail}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {savingInvoiceEmail ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save email settings
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInvoiceEmail(DEFAULT_INVOICE_EMAIL)}
                disabled={savingInvoiceEmail || sendingTestEmail}
              >
                Reset to defaults
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="invoice-test-to">Send test email</Label>
              <p className="text-xs text-slate-500">
                Uses the form above (even if not saved yet) and a sample order. Requires SMTP
                credentials in the server environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                <Input
                  id="invoice-test-to"
                  type="email"
                  placeholder="you@example.com"
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  disabled={sendingTestEmail}
                  onClick={() => void handleTestInvoiceEmail()}
                >
                  {sendingTestEmail ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Number for the sticky chat button (bottom-right on the storefront). Use country code
              without + (e.g. 8801335107218).
            </p>
            <div className="space-y-2 max-w-md">
              <Label htmlFor="whatsapp-number">WhatsApp number</Label>
              <Input
                id="whatsapp-number"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="8801335107218"
                inputMode="tel"
              />
            </div>

            <div className="space-y-3">
              <Label>Chat button icon</Label>
              <p className="text-xs text-slate-500">
                Pick a style, or choose an image from the media library (PNG/JPG/WEBP/SVG · square recommended).
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {WHATSAPP_ICON_PRESETS.map((preset) => {
                  const selected = whatsappIconId === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => void handleSelectWhatsappIcon(preset.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <WhatsAppIconButton iconId={preset.id} size="sm" />
                      <span className="text-xs font-medium text-slate-700">{preset.label}</span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => {
                    if (whatsappIconUrl) void handleSelectWhatsappIcon('custom')
                  }}
                  disabled={!whatsappIconUrl}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
                    whatsappIconId === 'custom'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white disabled:opacity-50'
                  }`}
                >
                  {whatsappIconUrl ? (
                    <WhatsAppIconButton iconId="custom" iconUrl={whatsappIconUrl} size="sm" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400">
                      <Upload className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-700">Custom</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <MediaPickerButton
                  label="Select / Upload icon"
                  title="WhatsApp chat icon"
                  folder="branding"
                  accept="image"
                  currentUrl={whatsappIconId === 'custom' ? whatsappIconUrl : ''}
                  loading={uploadingWhatsappIcon}
                  variant="outline"
                  onSelect={(url) => void handleWhatsappIconSelect(url)}
                />
                {whatsappIconUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleResetWhatsappIcon()}
                    disabled={uploadingWhatsappIcon}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reset custom
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-600" />
              Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Free delivery kicks in when the cart subtotal reaches the minimum. Below that,
              the delivery charge is applied at cart and checkout.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="free-delivery-min">Free delivery from</Label>
                <Input
                  id="free-delivery-min"
                  type="number"
                  min={0}
                  step="1"
                  value={freeDeliveryMin}
                  onChange={(e) => setFreeDeliveryMin(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-charge">Delivery charge</Label>
                <Input
                  id="delivery-charge"
                  type="number"
                  min={0}
                  step="1"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={() => void handleSaveCommerce()}
              disabled={savingCommerce}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {savingCommerce ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save WhatsApp, social & delivery
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5 text-sky-600" />
              Social links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              These URLs power the Facebook, Instagram, and TikTok icons in the storefront footer.
              Leave a field empty to hide that icon.
            </p>
            <div className="space-y-3 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="facebook-url">Facebook</Label>
                <Input
                  id="facebook-url"
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://www.facebook.com/GBBFashion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-url">Instagram</Label>
                <Input
                  id="instagram-url"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/yourpage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok-url">TikTok</Label>
                <Input
                  id="tiktok-url"
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@yourpage"
                />
              </div>
            </div>
            <Button
              onClick={() => void handleSaveCommerce()}
              disabled={savingCommerce}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {savingCommerce ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save social links
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-600" />
              Site Logo & Browser Tab Icon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Recommended logo size</p>
              <p>512 × 512 px (square) · PNG with transparent background preferred</p>
              <p>Formats: PNG, JPG, WEBP, SVG · Max 2MB · Also used as the browser tab favicon</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div
                className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0"
                style={{ width: Math.max(logoWidth, 64), height: Math.max(logoHeight, 64) }}
              >
                {loadingLogo ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : displayLogo ? (
                  <img
                    src={displayLogo}
                    alt="Site logo preview"
                    className="absolute inset-0 h-full w-full object-contain object-center p-1"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400 px-2 text-center">
                    No logo
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <p className="text-xs text-slate-500">
                    Pick from the media library or upload a new image (PNG/JPG/WEBP/SVG).
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <MediaPickerButton
                    label="Select / Upload logo"
                    title="Site logo"
                    folder="branding"
                    accept="image"
                    currentUrl={logoUrl}
                    loading={uploading}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                    onSelect={(url) => void handleLogoSelect(url)}
                  />
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={uploading || !logoUrl}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Logo
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Logo size (px)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-width" className="text-slate-600 font-normal">
                    Width
                  </Label>
                  <Input
                    id="logo-width"
                    type="text"
                    inputMode="numeric"
                    value={widthInput}
                    onChange={(e) => setWidthInput(e.target.value.replace(/[^\d]/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleSaveSize()
                      }
                    }}
                    placeholder="e.g. 48"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-height" className="text-slate-600 font-normal">
                    Height
                  </Label>
                  <Input
                    id="logo-height"
                    type="text"
                    inputMode="numeric"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value.replace(/[^\d]/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleSaveSize()
                      }
                    }}
                    placeholder="e.g. 48"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Enter width and height from 16 to 200, then click Save.
              </p>
              <Button
                onClick={handleSaveSize}
                disabled={savingSize || widthInput.trim() === '' || heightInput.trim() === ''}
                className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto"
              >
                {savingSize ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Logo Size
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-amber-600" />
              Homepage Hero (Image or Video)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-950 space-y-1">
              <p className="font-semibold">Recommended sizes</p>
              <p>
                <span className="font-medium">Image:</span> 1920 × 1080 px (16:9) · JPG/PNG/WEBP · Max 5MB
              </p>
              <p>
                <span className="font-medium">Video:</span> 1920 × 1080 px (16:9) · MP4/WEBM · No size limit · Plays automatically on loop
              </p>
              <p>Hero area is wide and tall — landscape media looks best.</p>
            </div>

            <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
              {displayHero ? (
                heroMediaType === 'video' ? (
                  <video
                    key={displayHero}
                    src={displayHero}
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img
                    key={displayHero}
                    src={displayHero}
                    alt="Hero preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
                  No hero media
                </div>
              )}
              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                Current: {displayHero ? heroMediaType : 'empty'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <MediaPickerButton
                label="Select / Upload hero"
                title="Homepage hero (image or video)"
                folder="branding"
                accept="media"
                currentUrl={heroMediaUrl}
                loading={uploadingHero}
                className="bg-slate-900 hover:bg-slate-800 text-white"
                onSelect={(url, item) => void handleHeroSelect(url, item)}
              />
              <Button
                variant="outline"
                onClick={handleHeroReset}
                disabled={uploadingHero || !heroMediaUrl}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Hero
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
