import { NextRequest, NextResponse } from 'next/server'
import { confirmSslPayment } from '@/lib/ssl-payment-service'

/**
 * Instant Payment Notification — SSLCommerz server callback.
 * Must validate via API; do not trust posted fields alone.
 */
export async function POST(request: NextRequest) {
  try {
    const fields: Record<string, string> = {}
    const form = await request.formData().catch(() => null)
    if (form) {
      form.forEach((value, key) => {
        if (typeof value === 'string') fields[key] = value
      })
    } else {
      const json = await request.json().catch(() => null)
      if (json && typeof json === 'object') {
        for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
          if (v != null) fields[k] = String(v)
        }
      }
    }

    const tranId = fields.tran_id || fields.value_a || ''
    const valId = fields.val_id || ''
    const status = (fields.status || '').toUpperCase()

    if (!tranId) {
      return NextResponse.json({ message: 'ignored', reason: 'no tran_id' })
    }

    if (status === 'VALID' || status === 'VALIDATED' || valId) {
      const result = await confirmSslPayment({
        tranId,
        valId,
        amountFromGateway: fields.amount || fields.currency_amount,
      })
      return NextResponse.json({
        message: result.ok ? 'Payment confirmed' : 'Validation failed',
        ok: result.ok,
        reason: result.ok ? undefined : result.reason,
      })
    }

    return NextResponse.json({ message: 'ignored', status })
  } catch (error) {
    console.error('SSLCommerz IPN error:', error)
    return NextResponse.json({ error: 'IPN processing failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, listener: 'sslcommerz-ipn' })
}
