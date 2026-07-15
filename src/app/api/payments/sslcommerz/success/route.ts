import { NextRequest, NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/sslcommerz'
import { confirmSslPayment } from '@/lib/ssl-payment-service'

async function readCallbackFields(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  const fields: Record<string, string> = {}

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}))
    if (body && typeof body === 'object') {
      for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
        if (v != null) fields[k] = String(v)
      }
    }
  } else {
    const form = await request.formData().catch(() => null)
    if (form) {
      form.forEach((value, key) => {
        if (typeof value === 'string') fields[key] = value
      })
    }
  }

  // Also accept query params (some environments GET-redirect)
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!(key in fields)) fields[key] = value
  })

  return fields
}

async function handleSuccess(request: NextRequest) {
  const baseUrl = getAppBaseUrl(request.url)
  const fields = await readCallbackFields(request)
  const tranId = fields.tran_id || fields.value_a || ''
  const valId = fields.val_id || ''

  if (!tranId) {
    return NextResponse.redirect(`${baseUrl}/checkout?payment=failed`)
  }

  const result = await confirmSslPayment({
    tranId,
    valId,
    amountFromGateway: fields.amount || fields.currency_amount,
  })

  if (!result.ok) {
    console.error('SSL success handling failed:', result.reason, fields)
    return NextResponse.redirect(
      `${baseUrl}/checkout?payment=failed&order=${encodeURIComponent(tranId)}`
    )
  }

  return NextResponse.redirect(
    `${baseUrl}/confirmation?order=${encodeURIComponent(result.orderId)}&payment=success`
  )
}

export async function POST(request: NextRequest) {
  return handleSuccess(request)
}

export async function GET(request: NextRequest) {
  return handleSuccess(request)
}
