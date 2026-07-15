export type PaymentMethod = 'cod' | 'sslcommerz'

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'

export const PAYMENT_METHODS = {
  COD: 'cod',
  SSLCOMMERZ: 'sslcommerz',
} as const satisfies Record<string, PaymentMethod>

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const satisfies Record<string, PaymentStatus>

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === 'cod' || value === 'sslcommerz'
}

export function paymentMethodLabel(method: string | null | undefined): string {
  if (method === 'sslcommerz') return 'Online (SSLCommerz)'
  if (method === 'cod') return 'Cash on Delivery'
  return '—'
}

export function paymentStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'paid':
      return 'Paid'
    case 'pending':
      return 'Awaiting payment'
    case 'failed':
      return 'Failed'
    case 'cancelled':
      return 'Cancelled'
    case 'unpaid':
      return 'Unpaid'
    default:
      return status || '—'
  }
}

export function isOrderPaid(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === 'paid'
}

/** Amount already collected vs still owed */
export function paymentBalance(opts: {
  totalAmount: number
  paymentStatus?: string | null
}): { amountPaid: number; amountDue: number } {
  const total = Number(opts.totalAmount) || 0
  if (isOrderPaid(opts.paymentStatus)) {
    return { amountPaid: total, amountDue: 0 }
  }
  return { amountPaid: 0, amountDue: total }
}

export function orderLineSubtotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return (
    Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100
  )
}

export function invoicePaymentNote(opts: {
  paymentMethod?: string | null
  paymentStatus?: string | null
  amountDue: number
  currencySymbol?: string
}): string | null {
  const method = opts.paymentMethod || ''

  // COD-only note on invoices
  if (method !== 'cod') return null

  if (opts.paymentStatus === 'paid') {
    return 'Cash received for this Cash on Delivery order. No balance due.'
  }

  return 'Payment should be received when the order is delivered.'
}
