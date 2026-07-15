/**
 * Google Tag Manager dataLayer helpers.
 * Use these event names as Custom Event triggers in GTM:
 *   view_item | add_to_cart | begin_checkout | purchase
 *   select_promotion | select_item | view_item_list
 */

export type GtmItem = {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  price: number
  quantity: number
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

const DEFAULT_CURRENCY = 'BDT'

function push(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

/** Clear previous ecommerce object (GA4 / GTM best practice) */
function clearEcommerce() {
  push({ ecommerce: null })
}

export function trackViewItem(item: Omit<GtmItem, 'quantity'>, currency = DEFAULT_CURRENCY) {
  clearEcommerce()
  push({
    event: 'view_item',
    ecommerce: {
      currency,
      value: item.price,
      items: [{ ...item, quantity: 1 }],
    },
  })
}

export function trackAddToCart(
  item: Omit<GtmItem, 'quantity'> & { quantity?: number },
  currency = DEFAULT_CURRENCY
) {
  const quantity = item.quantity ?? 1
  const line: GtmItem = {
    item_id: item.item_id,
    item_name: item.item_name,
    item_category: item.item_category,
    item_variant: item.item_variant,
    price: item.price,
    quantity,
  }
  clearEcommerce()
  push({
    event: 'add_to_cart',
    ecommerce: {
      currency,
      value: line.price * quantity,
      items: [line],
    },
  })
}

export function trackBeginCheckout(
  items: GtmItem[],
  value: number,
  currency = DEFAULT_CURRENCY
) {
  clearEcommerce()
  push({
    event: 'begin_checkout',
    ecommerce: {
      currency,
      value,
      items,
    },
  })
}

export function trackPurchase(params: {
  transaction_id: string
  value: number
  items: GtmItem[]
  currency?: string
  shipping?: number
  tax?: number
}) {
  if (typeof window === 'undefined') return
  const key = `gtm_purchase_${params.transaction_id}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // private mode — still fire once this session in memory is fine
  }

  clearEcommerce()
  push({
    event: 'purchase',
    ecommerce: {
      transaction_id: params.transaction_id,
      currency: params.currency ?? DEFAULT_CURRENCY,
      value: params.value,
      shipping: params.shipping ?? 0,
      tax: params.tax ?? 0,
      items: params.items,
    },
  })
}

export function cartItemsToGtm(
  cart: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    color?: string | null
  }>
): GtmItem[] {
  return cart.map((c) => ({
    item_id: c.productId,
    item_name: c.name,
    item_variant: c.color && c.color !== 'Default' ? c.color : undefined,
    price: c.price,
    quantity: c.quantity,
  }))
}

/** Promo banner CTA (Prime Drop / New Arrivals etc.) */
export function trackSelectPromotion(params: {
  promotion_id: string
  promotion_name: string
  creative_name?: string
  creative_slot?: string
}) {
  clearEcommerce()
  push({
    event: 'select_promotion',
    ecommerce: {
      items: [],
      creative_name: params.creative_name ?? params.promotion_name,
      creative_slot: params.creative_slot,
      promotion_id: params.promotion_id,
      promotion_name: params.promotion_name,
    },
  })
}

/** Click a product from a homepage list (Prime Bags / Shoes) */
export function trackSelectItem(params: {
  item_list_id: string
  item_list_name: string
  item: Omit<GtmItem, 'quantity'> & { quantity?: number }
}) {
  clearEcommerce()
  push({
    event: 'select_item',
    ecommerce: {
      item_list_id: params.item_list_id,
      item_list_name: params.item_list_name,
      items: [{ ...params.item, quantity: params.item.quantity ?? 1 }],
    },
  })
}

/** When a product list becomes visible */
export function trackViewItemList(params: {
  item_list_id: string
  item_list_name: string
  items: Array<Omit<GtmItem, 'quantity'> & { quantity?: number }>
}) {
  clearEcommerce()
  push({
    event: 'view_item_list',
    ecommerce: {
      item_list_id: params.item_list_id,
      item_list_name: params.item_list_name,
      items: params.items.map((item, index) => ({
        ...item,
        quantity: item.quantity ?? 1,
        index,
      })),
    },
  })
}
