import {
  buildOrderItemProductName,
  parseOrderItemFields,
} from '@/lib/order-items'
import { resolveProductColorVariants } from '@/lib/product-colors'
import { resolveVariantPricing } from '@/lib/product-pricing'

export const RETURN_TYPES = {
  RETURN: 'return',
  EXCHANGE: 'exchange',
} as const

export type ReturnType = (typeof RETURN_TYPES)[keyof typeof RETURN_TYPES]

export const RETURN_RECORD_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type ReturnRecordStatus =
  (typeof RETURN_RECORD_STATUS)[keyof typeof RETURN_RECORD_STATUS]

export const ORDER_RETURN_PHASE = {
  RETURNING: 'returning',
  EXCHANGING: 'exchanging',
  RETURNED: 'returned',
  EXCHANGED: 'exchanged',
} as const

export const RETURN_REASONS = [
  'Wrong size',
  'Wrong color',
  'Damaged / defective',
  'Not as described',
  'Changed mind',
  'Other',
] as const

export type ReturnLineInput = {
  orderItemId: string
  quantity: number
  exchangeColor?: string | null
  exchangeSize?: string | null
}

export function isReturnType(value: unknown): value is ReturnType {
  return value === RETURN_TYPES.RETURN || value === RETURN_TYPES.EXCHANGE
}

/** How many units of each order line are still eligible for return/exchange. */
export function remainingReturnableQty(
  orderItems: { id: string; quantity: number }[],
  priorReturnItems: {
    orderItemId: string
    quantity: number
    returnRecord?: { status?: string }
  }[]
): Record<string, number> {
  const remaining: Record<string, number> = {}
  for (const item of orderItems) {
    remaining[item.id] = item.quantity
  }
  for (const ri of priorReturnItems) {
    if (ri.returnRecord?.status === RETURN_RECORD_STATUS.CANCELLED) continue
    remaining[ri.orderItemId] = Math.max(
      0,
      (remaining[ri.orderItemId] ?? 0) - ri.quantity
    )
  }
  return remaining
}

export function buildExchangeProductName(
  originalProductName: string,
  color?: string | null,
  size?: string | null
) {
  const parsed = parseOrderItemFields({
    productName: originalProductName,
    quantity: 1,
    price: 0,
  })
  return buildOrderItemProductName(parsed.baseName, color, size)
}

/** Unit price for a product color/size from catalog (falls back to product / line price). */
export function resolveExchangeUnitPrice(
  product: {
    price: number
    originalPrice?: number | null
    galleryImages?: string | null
    colors?: string | null
    image?: string
    secondaryImage?: string | null
  } | null | undefined,
  color?: string | null,
  size?: string | null,
  fallbackPrice = 0
): number {
  if (!product) {
    return Math.round((Number(fallbackPrice) || 0) * 100) / 100
  }
  const variants = resolveProductColorVariants({
    ...product,
    image: product.image || '',
  })
  const colorKey = (color || '').trim().toLowerCase()
  const variant =
    (colorKey
      ? variants.find((v) => v.name.trim().toLowerCase() === colorKey)
      : null) ||
    variants[0] ||
    null
  const pricing = resolveVariantPricing(
    variant,
    size,
    product.price,
    product.originalPrice ?? null
  )
  return Math.round(pricing.price * 100) / 100
}

/** Preserve shipping while rebuilding order total from line items. */
export function orderTotalFromItems(
  items: Array<{ price: number; quantity: number }>,
  previousTotal: number,
  previousItems: Array<{ price: number; quantity: number }>
): number {
  const oldSubtotal = previousItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const newSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const shipping = Math.max(
    0,
    Math.round((previousTotal - oldSubtotal) * 100) / 100
  )
  return Math.round((newSubtotal + shipping) * 100) / 100
}

/** Pending RMA moves the order into a confirmation phase. */
export function resolveStatusAfterPendingReturn(type: ReturnType): 'returning' | 'exchanging' {
  return type === RETURN_TYPES.EXCHANGE
    ? ORDER_RETURN_PHASE.EXCHANGING
    : ORDER_RETURN_PHASE.RETURNING
}

/** After a return/exchange is confirmed, decide fulfillment status. */
export function resolveStatusAfterReturn(args: {
  type: ReturnType
  orderItemQty: number
  totalReturnedQty: number
}): 'delivered' | 'returned' | 'exchanged' {
  const fullyHandled = args.totalReturnedQty >= args.orderItemQty
  if (!fullyHandled) return 'delivered'
  return args.type === RETURN_TYPES.EXCHANGE
    ? ORDER_RETURN_PHASE.EXCHANGED
    : ORDER_RETURN_PHASE.RETURNED
}

export function isReturnPendingStatus(status: string) {
  return (
    status === ORDER_RETURN_PHASE.RETURNING ||
    status === ORDER_RETURN_PHASE.EXCHANGING
  )
}

export function isReturnFinalStatus(status: string) {
  return (
    status === ORDER_RETURN_PHASE.RETURNED ||
    status === ORDER_RETURN_PHASE.EXCHANGED
  )
}
