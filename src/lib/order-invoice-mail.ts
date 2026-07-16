import { buildInvoicePdf, type InvoicePdfOrder } from '@/lib/invoice-pdf'
import { sendMail } from '@/lib/mail'
import { getSiteSettings } from '@/lib/site-settings'
import { CURRENCIES, DEFAULT_CURRENCY_CODE } from '@/lib/currency'
import {
  applyInvoicePlaceholders,
  normalizeInvoiceEmailSettings,
  renderInvoiceEmailHtml,
  renderInvoiceEmailText,
  type InvoiceEmailSettings,
  type InvoiceEmailVars,
} from '@/lib/invoice-email-settings'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function buildVars(
  order: InvoicePdfOrder,
  currencySymbol: string
): InvoiceEmailVars {
  return {
    orderId: order.id,
    customerName: order.customerName || 'there',
    total: Number(order.totalAmount).toLocaleString(),
    currencySymbol,
  }
}

/** Email invoice PDF when the customer provided an email address. */
export async function sendOrderInvoiceEmail(
  order: InvoicePdfOrder,
  options?: {
    /** Override recipient (admin test send) */
    to?: string
    /** Use these settings instead of saved (preview before save) */
    invoiceEmail?: InvoiceEmailSettings
  }
) {
  const to = String(options?.to || order.customerEmail || '')
    .trim()
    .toLowerCase()
  if (!to || !isValidEmail(to)) {
    return { ok: false as const, reason: 'No customer email' }
  }

  const settings = await getSiteSettings()
  const invoiceEmail = normalizeInvoiceEmailSettings(
    options?.invoiceEmail ?? settings.invoiceEmail
  )
  const currency =
    CURRENCIES.find((c) => c.code === (settings.currencyCode || DEFAULT_CURRENCY_CODE)) ||
    CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY_CODE)!
  const symbol = currency.symbol
  const vars = buildVars(order, symbol)

  const subject = applyInvoicePlaceholders(invoiceEmail.subject, vars)
  const text = renderInvoiceEmailText(invoiceEmail, vars)
  const html = renderInvoiceEmailHtml(invoiceEmail, vars)

  const attachments = invoiceEmail.attachPdf
    ? [
        {
          filename: `GBB-Invoice-${order.id}.pdf`,
          content: await buildInvoicePdf(order, symbol),
          contentType: 'application/pdf' as const,
        },
      ]
    : undefined

  return sendMail({
    to,
    subject,
    text,
    html,
    attachments,
  })
}

/** Sample order used for admin test emails */
export function buildSampleInvoiceOrder(toEmail: string): InvoicePdfOrder {
  return {
    id: `TEST-${Date.now().toString(36).toUpperCase()}`,
    customerName: 'Test Customer',
    customerEmail: toEmail,
    customerPhone: '01700000000',
    shippingAddress: '123 Test Street',
    city: 'Dhaka',
    state: 'Dhaka',
    zipCode: '1200',
    totalAmount: 2500,
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    items: [
      { productName: 'Sample Handbag', quantity: 1, price: 2000 },
      { productName: 'Sample Wallet', quantity: 1, price: 500 },
    ],
  }
}
