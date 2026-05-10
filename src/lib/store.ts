import { create } from 'zustand'

export type ViewType = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'admin' | 'login' | 'signup'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

export type ProductTab = 'new' | 'prime'

export interface UserInfo {
  id: string
  name: string
  email: string
  role: string
}

interface StoreState {
  view: ViewType
  selectedProductId: string | null
  cart: CartItem[]
  orderId: string | null
  categoryFilter: string
  searchQuery: string
  productTab: ProductTab
  user: UserInfo | null

  setView: (view: ViewType) => void
  selectProduct: (productId: string | null) => void
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setOrderId: (orderId: string | null) => void
  setCategoryFilter: (category: string) => void
  setSearchQuery: (query: string) => void
  setProductTab: (tab: ProductTab) => void
  setUser: (user: UserInfo | null) => void
  isAuthenticated: () => boolean
  cartTotal: () => number
  cartCount: () => number
}

export const useStore = create<StoreState>((set, get) => ({
  view: 'home',
  selectedProductId: null,
  cart: [],
  orderId: null,
  categoryFilter: 'all',
  searchQuery: '',
  productTab: 'new',
  user: null,

  setView: (view) => set({ view }),
  selectProduct: (productId) => set({ selectedProductId: productId }),

  addToCart: (item) => {
    const { cart } = get()
    const existing = cart.find((c) => c.productId === item.productId)
    if (existing) {
      set({
        cart: cart.map((c) =>
          c.productId === item.productId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        ),
      })
    } else {
      set({ cart: [...cart, { ...item, quantity: 1 }] })
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((c) => c.productId !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set({ cart: get().cart.filter((c) => c.productId !== productId) })
    } else {
      set({
        cart: get().cart.map((c) =>
          c.productId === productId ? { ...c, quantity } : c
        ),
      })
    }
  },

  clearCart: () => set({ cart: [] }),
  setOrderId: (orderId) => set({ orderId }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setProductTab: (tab) => set({ productTab: tab }),
  setUser: (user) => set({ user }),

  isAuthenticated: () => !!get().user,

  cartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  cartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
