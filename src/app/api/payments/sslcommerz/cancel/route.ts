import { NextRequest, NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/sslcommerz'
import { markSslPaymentFailed } from '@/lib/ssl-payment-service'

async function readFields(request: NextRequest) {
  const fields: Record<string, string> = {}
  const form = await request.formData().catch(() => null)
  if (form) {
    form.forEach((value, key) => {
      if (typeof value === 'string') fields[key] = value
    })
  }
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!(key in fields)) fields[key] = value
  })
  return fields
}

async function handleCancel(request: NextRequest) {
  const baseUrl = getAppBaseUrl(request.url)
  const fields = await readFields(request)
  const tranId = fields.tran_id || fields.value_a || ''

  if (tranId) {
    await markSslPaymentFailed(tranId, 'cancelled', {
      status: fields.status || 'CANCELLED',
    })
  }

  const q = new URLSearchParams({ payment: 'cancelled' })
  if (tranId) q.set('order', tranId)
  return NextResponse.redirect(`${baseUrl}/checkout?${q.toString()}`)
}

export async function POST(request: NextRequest) {
  return handleCancel(request)
}

export async function GET(request: NextRequest) {
  return handleCancel(request)
}
