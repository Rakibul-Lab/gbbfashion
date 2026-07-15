import { db } from '@/lib/db'
import { PAYMENT_STATUS } from '@/lib/payment'
import {
  amountsMatch,
  validateSslCommerzPayment,
  type SslValidateResponse,
} from '@/lib/sslcommerz'

type OrderLike = {
  id: string
  totalAmount: number
  paymentStatus: string
  paymentMethod: string
}

function summarizeValidation(v: SslValidateResponse) {
  return JSON.stringify({
    status: v.status,
    tran_id: v.tran_id,
    val_id: v.val_id,
    amount: v.amount,
    store_amount: v.store_amount,
    currency: v.currency,
    bank_tran_id: v.bank_tran_id,
    card_type: v.card_type,
    card_brand: v.card_brand,
    risk_level: v.risk_level,
    risk_title: v.risk_title,
    tran_date: v.tran_date,
  })
}

/**
 * Validate with SSLCommerz and mark the order paid (idempotent).
 * Returns updated order or null if validation failed.
 */
export async function confirmSslPayment(opts: {
  tranId: string
  valId: string
  amountFromGateway?: string | number
}): Promise<{ ok: true; orderId: string } | { ok: false; reason: string }> {
  const order = (await db.order.findFirst({
    where: {
      OR: [{ id: opts.tranId }, { transactionId: opts.tranId }],
    },
  })) as OrderLike | null

  if (!order) {
    return { ok: false, reason: 'Order not found' }
  }

  if (order.paymentMethod !== 'sslcommerz') {
    return { ok: false, reason: 'Order is not an online payment order' }
  }

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    return { ok: true, orderId: order.id }
  }

  if (!opts.valId) {
    return { ok: false, reason: 'Missing validation id' }
  }

  let validated: SslValidateResponse
  try {
    validated = await validateSslCommerzPayment(opts.valId)
  } catch (error) {
    console.error('SSLCommerz validate error:', error)
    return { ok: false, reason: 'Validation API failed' }
  }

  const status = (validated.status || '').toUpperCase()
  if (status !== 'VALID' && status !== 'VALIDATED') {
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PAYMENT_STATUS.FAILED,
        paymentMeta: summarizeValidation(validated),
      },
    })
    return { ok: false, reason: `Invalid payment status: ${validated.status || 'unknown'}` }
  }

  if (validated.tran_id && validated.tran_id !== order.id && validated.tran_id !== opts.tranId) {
    return { ok: false, reason: 'Transaction id mismatch' }
  }

  const amountOk =
    amountsMatch(validated.amount, order.totalAmount) ||
    amountsMatch(opts.amountFromGateway, order.totalAmount)

  if (!amountOk) {
    console.error('SSLCommerz amount mismatch', {
      orderId: order.id,
      expected: order.totalAmount,
      validated: validated.amount,
      callback: opts.amountFromGateway,
    })
    return { ok: false, reason: 'Amount mismatch' }
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: PAYMENT_STATUS.PAID,
      status: 'processing',
      sslValId: validated.val_id || opts.valId,
      sslBankTranId: validated.bank_tran_id || null,
      sslCardType: validated.card_type || validated.card_brand || null,
      paidAt: new Date(),
      paymentMeta: summarizeValidation(validated),
      transactionId: order.id,
    },
  })

  return { ok: true, orderId: order.id }
}

export async function markSslPaymentFailed(
  tranId: string,
  reason: 'failed' | 'cancelled',
  meta?: Record<string, unknown>
) {
  const order = await db.order.findFirst({
    where: {
      OR: [{ id: tranId }, { transactionId: tranId }],
    },
  })
  if (!order) return null
  if (order.paymentStatus === PAYMENT_STATUS.PAID) return order

  return db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus:
        reason === 'cancelled' ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.FAILED,
      status: 'cancelled',
      paymentMeta: meta ? JSON.stringify(meta) : order.paymentMeta,
    },
  })
}
