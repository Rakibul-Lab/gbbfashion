import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import type { ShopMode } from '@/lib/categories'
import { resolveShopMode } from '@/lib/categories'
import type { ShopRouteParams } from '@/lib/shop-navigation'
import { buildViewPath } from '@/lib/view-routes'
import { appNavigate } from '@/lib/app-navigate'
import { cartLineKey } from '@/lib/product-colors'
import { trackAddToCart } from '@/lib/gtm'

/**
 * Blocks localStorage writes until persist has rehydrated.
 * Prevents empty SSR cart from wiping saved cart on first set() (e.g. route hydrate).
 */
let persistWritesEnabled = false

const guardedLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(name)
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined' || !persistWritesEnabled) return
    localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

export function enableStorePersistWrites() {
  persistWritesEnabled = true
}

const USER_CARTS_KEY = 'gbb-user-carts'

function readUserCarts(): Record<string, CartItem[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(USER_CARTS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, CartItem[]>
  } catch {
    return {}
  }
}

function writeUserCart(userId: string, cart: CartItem[]) {
  if (typeof window === 'undefined' || !userId) return
  try {
    const all = readUserCarts()
    if (cart.length === 0) {
      delete all[userId]
    } else {
      all[userId] = cart
    }
    localStorage.setItem(USER_CARTS_KEY, JSON.stringify(all))
  } catch {
    // ignore quota / private mode
  }
}

function loadUserCart(userId: string): CartItem[] {
  if (!userId) return []
  const cart = readUserCarts()[userId]
  return Array.isArray(cart) ? cart : []
}

function mergeCarts(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>()
  for (const item of [...base, ...incoming]) {
    const key = cartLineKey(item.productId, item.color, item.size)
    const existing = map.get(key)
    if (existing) {
      map.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        image: item.image || existing.image,
        colorSwatch: item.colorSwatch ?? existing.colorSwatch,
        size: item.size ?? existing.size,
      })
    } else {
      map.set(key, { ...item })
    }
  }
  return Array.from(map.values())
}

function syncActiveUserCart(userId: string | undefined, cart: CartItem[]) {
  if (!userId) return
  writeUserCart(userId, cart)
}

export type ViewType = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'admin' | 'login' | 'signup' | 'account'

export type AccountTab = 'profile' | 'settings' | 'orders'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  /** Selected color name (unique cart line per color + size) */
  color?: string | null
  colorSwatch?: string | null
  /** Selected size label when the color has sizes */
  size?: string | null
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
  subCategoryFilter: string | null
  /** Homepage Prime Bags / Shoes → shop filter (`bags` | `shoes`) */
  collectionFilter: string | null
  shopMode: ShopMode
  searchQuery: string
  productTab: ProductTab
  accountTab: AccountTab
  user: UserInfo | null
  /** Where to send the user after login/signup (e.g. cart) */
  postLoginView: ViewType | null
  /** Skip one URL write after hydrating from the address bar */
  _skipNextUrlSync: boolean

  setView: (view: ViewType, options?: { replace?: boolean; syncUrl?: boolean }) => void
  setAccountTab: (tab: AccountTab, options?: { syncUrl?: boolean }) => void
  selectProduct: (productId: string | null) => void
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (
    productId: string,
    color?: string | null,
    size?: string | null
  ) => void
  updateQuantity: (
    productId: string,
    quantity: number,
    color?: string | null,
    size?: string | null
  ) => void
  clearCart: () => void
  setOrderId: (orderId: string | null) => void
  setCategoryFilter: (category: string) => void
  setSubCategoryFilter: (subCategory: string | null) => void
  setCollectionFilter: (collection: string | null) => void
  setShopMode: (mode: ShopMode) => void
  navigateToShop: (options?: {
    category?: string
    subCategory?: string | null
    shopMode?: ShopMode
    collection?: string | null
    updateUrl?: boolean
  }) => void
  applyShopRoute: (params: ShopRouteParams) => void
  applyRouteState: (state: {
    view: ViewType
    productId?: string | null
    accountTab?: AccountTab
    orderId?: string | null
  }) => void
  setSearchQuery: (query: string) => void
  setProductTab: (tab: ProductTab) => void
  setUser: (user: UserInfo | null) => void
  setPostLoginView: (view: ViewType | null) => void
  /** Open a view that requires login; sends guests to sign-in first */
  requireAuthView: (
    view: ViewType,
    options?: { replace?: boolean; message?: string }
  ) => boolean
  consumePostLoginView: () => ViewType | null
  isAuthenticated: () => boolean
  cartTotal: () => number
  cartCount: () => number
}

function pushViewUrl(
  state: Pick<StoreState, 'view' | 'selectedProductId' | 'accountTab' | 'orderId'>,
  mode: 'push' | 'replace'
) {
  // Let Next.js own shop/product deep links when already on those paths
  if (typeof window !== 'undefined') {
    const path = window.location.pathname
    if (state.view === 'shop' && path.startsWith('/collections')) return
    if (state.view === 'product' && path.startsWith('/products/')) return
    // Stay on /admin?page=… while remaining in admin (don't strip the query)
    if (state.view === 'admin' && path.startsWith('/admin')) return
  }
  const path = buildViewPath(state.view, {
    productId: state.selectedProductId,
    accountTab: state.accountTab,
    orderId: state.orderId,
  })
  appNavigate(path, mode)
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      view: 'home',
      selectedProductId: null,
      cart: [],
      orderId: null,
      categoryFilter: 'all',
      subCategoryFilter: null,
      collectionFilter: null,
      shopMode: 'browse',
      searchQuery: '',
      productTab: 'new',
      accountTab: 'profile',
      user: null,
      postLoginView: null,
      _skipNextUrlSync: false,

      setView: (view, options) => {
        const syncUrl = options?.syncUrl !== false
        if (get().view === view) {
          if (!syncUrl || get()._skipNextUrlSync) {
            if (get()._skipNextUrlSync) set({ _skipNextUrlSync: false })
            return
          }
          pushViewUrl(get(), options?.replace ? 'replace' : 'push')
          return
        }
        set({ view })
        if (!syncUrl) return
        if (get()._skipNextUrlSync) {
          set({ _skipNextUrlSync: false })
          return
        }
        pushViewUrl(get(), options?.replace ? 'replace' : 'push')
      },

      setAccountTab: (tab, options) => {
        set({ accountTab: tab })
        if (options?.syncUrl === false) return
        const state = get()
        if (state.view === 'account') {
          pushViewUrl({ ...state, accountTab: tab }, 'replace')
        }
      },

      selectProduct: (productId) => set({ selectedProductId: productId }),

      addToCart: (item, quantity = 1) => {
        const qty = Math.max(1, Math.floor(quantity) || 1)
        const userId = get().user?.id
        const { cart } = get()
        const key = cartLineKey(item.productId, item.color, item.size)
        const existing = cart.find(
          (c) => cartLineKey(c.productId, c.color, c.size) === key
        )
        const nextCart = existing
          ? cart.map((c) =>
              cartLineKey(c.productId, c.color, c.size) === key
                ? {
                    ...c,
                    quantity: c.quantity + qty,
                    image: item.image || c.image,
                    colorSwatch: item.colorSwatch ?? c.colorSwatch,
                    size: item.size ?? c.size,
                  }
                : c
            )
          : [...cart, { ...item, quantity: qty }]

        set({ cart: nextCart })
        syncActiveUserCart(userId, nextCart)

        const variantParts = [
          item.color && item.color !== 'Default' ? item.color : null,
          item.size || null,
        ].filter(Boolean)

        trackAddToCart({
          item_id: item.productId,
          item_name: item.name,
          item_variant: variantParts.length ? variantParts.join(' / ') : undefined,
          price: item.price,
          quantity: qty,
        })
      },

      removeFromCart: (productId, color, size) => {
        const userId = get().user?.id
        const key = cartLineKey(productId, color, size)
        const nextCart = get().cart.filter(
          (c) => cartLineKey(c.productId, c.color, c.size) !== key
        )
        set({ cart: nextCart })
        syncActiveUserCart(userId, nextCart)
      },

      updateQuantity: (productId, quantity, color, size) => {
        const userId = get().user?.id
        const key = cartLineKey(productId, color, size)
        const nextCart =
          quantity <= 0
            ? get().cart.filter(
                (c) => cartLineKey(c.productId, c.color, c.size) !== key
              )
            : get().cart.map((c) =>
                cartLineKey(c.productId, c.color, c.size) === key
                  ? { ...c, quantity }
                  : c
              )
        set({ cart: nextCart })
        syncActiveUserCart(userId, nextCart)
      },

      clearCart: () => {
        const userId = get().user?.id
        set({ cart: [] })
        syncActiveUserCart(userId, [])
      },

      setOrderId: (orderId) => set({ orderId }),
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      setSubCategoryFilter: (subCategory) => set({ subCategoryFilter: subCategory }),
      setCollectionFilter: (collection) => set({ collectionFilter: collection }),
      setShopMode: (mode) => set({ shopMode: mode }),

      navigateToShop: (options = {}) => {
        const category = options.category ?? 'all'
        const shopMode = options.shopMode ?? resolveShopMode(category)
        const isSpecial = shopMode === 'new-arrivals' || shopMode === 'prime-drop'
        const subCategory = isSpecial ? null : (options.subCategory ?? null)
        const collection =
          options.collection !== undefined
            ? options.collection
            : options.category !== undefined
              ? null
              : get().collectionFilter

        set({
          view: 'shop',
          shopMode,
          categoryFilter: isSpecial ? 'all' : category,
          subCategoryFilter: subCategory,
          collectionFilter: isSpecial ? null : collection,
          productTab:
            shopMode === 'prime-drop'
              ? 'prime'
              : shopMode === 'new-arrivals'
                ? 'new'
                : get().productTab,
          // URL is owned by useShopNavigation / applyShopRoute
          _skipNextUrlSync: true,
        })
      },

      applyShopRoute: (params) => {
        const category = params.category ?? 'all'
        const shopMode = params.shopMode ?? resolveShopMode(category)
        const isSpecial = shopMode === 'new-arrivals' || shopMode === 'prime-drop'

        set({
          view: 'shop',
          shopMode,
          categoryFilter: isSpecial ? 'all' : category,
          subCategoryFilter: isSpecial ? null : (params.subCategory ?? null),
          collectionFilter: isSpecial ? null : get().collectionFilter,
          productTab:
            shopMode === 'prime-drop'
              ? 'prime'
              : shopMode === 'new-arrivals'
                ? 'new'
                : get().productTab,
          _skipNextUrlSync: true,
        })
      },

      applyRouteState: (route) => {
        const prev = get()
        const nextProductId =
          route.productId !== undefined ? route.productId : prev.selectedProductId
        const nextAccountTab = route.accountTab ?? prev.accountTab
        const nextOrderId =
          route.orderId !== undefined ? route.orderId : prev.orderId

        if (
          prev.view === route.view &&
          prev.selectedProductId === nextProductId &&
          prev.accountTab === nextAccountTab &&
          prev.orderId === nextOrderId
        ) {
          return
        }

        set({
          view: route.view,
          selectedProductId: nextProductId,
          accountTab: nextAccountTab,
          orderId: nextOrderId,
          _skipNextUrlSync: true,
        })
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setProductTab: (tab) => set({ productTab: tab }),

      setUser: (user) => {
        const prev = get().user
        const currentCart = get().cart

        // Persist outgoing user's cart, then clear session cart on logout
        if (prev?.id && (!user || prev.id !== user.id)) {
          syncActiveUserCart(prev.id, currentCart)
        }

        if (!user) {
          if (prev) set({ user: null, cart: [] })
          return
        }

        // Same user (session rehydrate) — avoid redundant setState loops
        if (
          prev?.id === user.id &&
          prev.name === user.name &&
          prev.email === user.email &&
          prev.role === user.role
        ) {
          return
        }

        // Same id but profile fields changed
        if (prev?.id === user.id) {
          set({ user })
          if (currentCart.length > 0) {
            syncActiveUserCart(user.id, currentCart)
          }
          return
        }

        // New login — restore account cart and merge any guest items
        const restored = loadUserCart(user.id)
        const nextCart = mergeCarts(restored, !prev ? currentCart : [])
        set({ user, cart: nextCart })
        syncActiveUserCart(user.id, nextCart)
      },

      setPostLoginView: (view) => set({ postLoginView: view }),

      requireAuthView: (view, options) => {
        if (get().user) {
          get().setView(view, { replace: options?.replace })
          return true
        }
        set({ postLoginView: view })
        get().setView('login', { replace: options?.replace ?? true })
        return false
      },

      consumePostLoginView: () => {
        const next = get().postLoginView
        if (next) set({ postLoginView: null })
        return next
      },

      isAuthenticated: () => !!get().user,

      cartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      cartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'gbb-store',
      storage: createJSONStorage(() => guardedLocalStorage),
      partialize: (state) => ({
        cart: state.cart,
        orderId: state.orderId,
      }),
      // Avoid SSR/client cart mismatch (localStorage rehydrates only on client)
      skipHydration: true,
      onRehydrateStorage: () => () => {
        enableStorePersistWrites()
      },
    }
  )
)
