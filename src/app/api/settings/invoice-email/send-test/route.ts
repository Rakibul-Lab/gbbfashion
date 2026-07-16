import { NextRequest, NextResponse } from 'next/server'
import {
  buildSampleInvoiceOrder,
  sendOrderInvoiceEmail,
} from '@/lib/order-invoice-mail'
import {
  normalizeInvoiceEmailSettings,
  type InvoiceEmailSettings,
} from '@/lib/invoice-email-settings'
import { smtpConfigured } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    if (!smtpConfigured()) {
      return NextResponse.json(
        {
          error:
            'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in the server environment.',
        },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const to = typeof body.to === 'string' ? body.to.trim().toLowerCase() : ''
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: 'Enter a valid test email address' }, { status: 400 })
    }

    const draft =
      body.invoiceEmail && typeof body.invoiceEmail === 'object'
        ? normalizeInvoiceEmailSettings(body.invoiceEmail as InvoiceEmailSettings)
        : undefined

    const sample = buildSampleInvoiceOrder(to)
    const result = await sendOrderInvoiceEmail(sample, {
      to,
      invoiceEmail: draft,
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason || 'Failed to send test email' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: `Test invoice email sent to ${to}`,
      sampleOrderId: sample.id,
    })
  } catch (error) {
    console.error('Invoice email test error:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
