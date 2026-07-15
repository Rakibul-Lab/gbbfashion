import type { AccountTab, ViewType } from '@/lib/store'

export interface ParsedAppRoute {
  view: ViewType
  productId?: string | null
  accountTab?: AccountTab
  orderId?: string | null
}

const ACCOUNT_TABS = new Set<AccountTab>(['profile', 'settings', 'orders'])

/** Map app views to URL paths (shop/product handled separately when possible). */
export function buildViewPath(
  view: ViewType,
  opts: {
    productId?: string | null
    accountTab?: AccountTab
    orderId?: string | null
  } = {}
): string {
  switch (view) {
    case 'home':
      return '/'
    case 'shop':
      return '/collections'
    case 'product':
      return opts.productId ? `/products/${opts.productId}` : '/'
    case 'cart':
      return '/cart'
    case 'checkout':
      return '/checkout'
    case 'confirmation': {
      const base = '/confirmation'
      return opts.orderId
        ? `${base}?order=${encodeURIComponent(opts.orderId)}`
        : base
    }
    case 'admin':
      return '/admin'
    case 'login':
      return '/login'
    case 'signup':
      return '/signup'
    case 'account': {
      const tab = opts.accountTab && opts.accountTab !== 'profile' ? opts.accountTab : null
      return tab ? `/account?tab=${tab}` : '/account'
    }
    default:
      return '/'
  }
}

export function parseAppPath(
  pathname: string,
  search = ''
): ParsedAppRoute | null {
  const path = pathname.replace(/\/$/, '') || '/'
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search
  )

  if (path === '/') return { view: 'home' }
  if (path === '/cart') return { view: 'cart' }
  if (path === '/checkout') return { view: 'checkout' }
  if (path === '/admin') return { view: 'admin' }
  if (path === '/login') return { view: 'login' }
  if (path === '/signup') return { view: 'signup' }
  if (path === '/confirmation') {
    return { view: 'confirmation', orderId: params.get('order') }
  }
  if (path === '/account') {
    const tabParam = params.get('tab') as AccountTab | null
    const accountTab =
      tabParam && ACCOUNT_TABS.has(tabParam) ? tabParam : 'profile'
    return { view: 'account', accountTab }
  }
  if (path.startsWith('/collections')) return { view: 'shop' }
  if (path.startsWith('/products/')) {
    const productId = path.slice('/products/'.length).split('/')[0] || null
    return { view: 'product', productId }
  }

  return null
}

/** Push or replace the browser URL without a full Next navigation when possible. */
export function syncBrowserUrl(
  path: string,
  mode: 'push' | 'replace' = 'push'
) {
  if (typeof window === 'undefined') return
  const current = `${window.location.pathname}${window.location.search}`
  if (current === path) return
  if (mode === 'replace') {
    window.history.replaceState(window.history.state, '', path)
  } else {
    window.history.pushState(window.history.state, '', path)
  }
}
