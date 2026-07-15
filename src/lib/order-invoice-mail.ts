import { buildInvoicePdf, type InvoicePdfOrder } from '@/lib/invoice-pdf'
import { sendMail } from '@/lib/mail'
import { getSiteSettings } from '@/lib/site-settings'
import { CURRENCIES, DEFAULT_CURRENCY_CODE } from '@/lib/currency'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** Email invoice PDF when the customer provided an email address. */
export async function sendOrderInvoiceEmail(order: InvoicePdfOrder) {
  const to = String(order.customerEmail || '').trim().toLowerCase()
  if (!to || !isValidEmail(to)) {
    return { ok: false as const, reason: 'No customer email' }
  }

  const settings = await getSiteSettings()
  const currency =
    CURRENCIES.find((c) => c.code === (settings.currencyCode || DEFAULT_CURRENCY_CODE)) ||
    CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY_CODE)!
  const symbol = currency.symbol

  const pdf = await buildInvoicePdf(order, symbol)
  const filename = `GBB-Invoice-${order.id}.pdf`

  const text = [
    `Hi ${order.customerName || 'there'},`,
    '',
    `Thank you for your order with GBB Fashion.`,
    `Invoice ID: ${order.id}`,
    `Total: ${symbol}${Number(order.totalAmount).toLocaleString()}`,
    '',
    'Your invoice is attached as a PDF.',
    '',
    'GBB Fashion',
    'www.gbbfashion.com',
  ].join('\n')

  const html = `
    <div style="font-family:Georgia,serif;color:#0f172a;line-height:1.55">
      <p>Hi ${escapeHtml(order.customerName || 'there')},</p>
      <p>Thank you for your order with <strong>GBB Fashion</strong>.</p>
      <p>
        <strong>Invoice ID:</strong> ${escapeHtml(order.id)}<br/>
        <strong>Total:</strong> ${escapeHtml(symbol)}${Number(order.totalAmount).toLocaleString()}
      </p>
      <p>Your invoice is attached as a PDF.</p>
      <p style="margin-top:24px;color:#64748b;font-size:13px">
        GBB Fashion · www.gbbfashion.com
      </p>
    </div>
  `

  return sendMail({
    to,
    subject: `Your GBB Fashion invoice ${order.id}`,
    text,
    html,
    attachments: [
      {
        filename,
        content: pdf,
        contentType: 'application/pdf',
      },
    ],
  })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
