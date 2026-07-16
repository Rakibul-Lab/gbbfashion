/** Invoice email templates + editable copy (client-safe) */

export type InvoiceEmailTemplateId = 'classic' | 'minimal' | 'branded'

export type InvoiceEmailSettings = {
  templateId: InvoiceEmailTemplateId
  /** Placeholders: {{orderId}} {{customerName}} {{total}} {{currencySymbol}} */
  subject: string
  greeting: string
  body: string
  footerText: string
  attachPdf: boolean
}

export const INVOICE_EMAIL_TEMPLATES: {
  id: InvoiceEmailTemplateId
  label: string
  description: string
}[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Warm serif layout with amber accent — default GBB look',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean sans-serif, lots of whitespace',
  },
  {
    id: 'branded',
    label: 'Branded',
    description: 'Bold dark header with brand block',
  },
]

export const DEFAULT_INVOICE_EMAIL: InvoiceEmailSettings = {
  templateId: 'classic',
  subject: 'Your GBB Fashion invoice {{orderId}}',
  greeting: 'Hi {{customerName}},',
  body: 'Thank you for your order with GBB Fashion.\n\nInvoice ID: {{orderId}}\nTotal: {{currencySymbol}}{{total}}',
  footerText: 'GBB Fashion · www.gbbfashion.com',
  attachPdf: true,
}

export function normalizeInvoiceEmailTemplateId(value: unknown): InvoiceEmailTemplateId {
  if (value === 'minimal' || value === 'branded' || value === 'classic') return value
  return DEFAULT_INVOICE_EMAIL.templateId
}

export function normalizeInvoiceEmailSettings(value: unknown): InvoiceEmailSettings {
  const src =
    value && typeof value === 'object' ? (value as Partial<InvoiceEmailSettings>) : {}
  const str = (v: unknown, fallback: string) =>
    typeof v === 'string' && v.trim() ? v.trim() : fallback

  return {
    templateId: normalizeInvoiceEmailTemplateId(src.templateId),
    subject: str(src.subject, DEFAULT_INVOICE_EMAIL.subject),
    greeting: str(src.greeting, DEFAULT_INVOICE_EMAIL.greeting),
    body: str(src.body, DEFAULT_INVOICE_EMAIL.body),
    footerText: str(src.footerText, DEFAULT_INVOICE_EMAIL.footerText),
    attachPdf: src.attachPdf !== false,
  }
}

export type InvoiceEmailVars = {
  orderId: string
  customerName: string
  total: string
  currencySymbol: string
}

export function applyInvoicePlaceholders(template: string, vars: InvoiceEmailVars): string {
  return template
    .replace(/\{\{\s*orderId\s*\}\}/gi, vars.orderId)
    .replace(/\{\{\s*customerName\s*\}\}/gi, vars.customerName)
    .replace(/\{\{\s*total\s*\}\}/gi, vars.total)
    .replace(/\{\{\s*currencySymbol\s*\}\}/gi, vars.currencySymbol)
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function bodyToHtmlParagraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => {
      const lines = escapeHtml(block).replace(/\n/g, '<br/>')
      return `<p style="margin:0 0 14px">${lines}</p>`
    })
    .join('')
}

/** Build HTML for the selected template using saved copy. */
export function renderInvoiceEmailHtml(
  settings: InvoiceEmailSettings,
  vars: InvoiceEmailVars
): string {
  const greeting = escapeHtml(applyInvoicePlaceholders(settings.greeting, vars))
  const bodyHtml = bodyToHtmlParagraphs(applyInvoicePlaceholders(settings.body, vars))
  const footer = escapeHtml(applyInvoicePlaceholders(settings.footerText, vars))
  const attachNote = settings.attachPdf
    ? `<p style="margin:18px 0 0;color:#64748b;font-size:13px">Your invoice is attached as a PDF.</p>`
    : ''

  if (settings.templateId === 'minimal') {
    return `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.55;max-width:560px;margin:0 auto;padding:28px 20px">
        <p style="margin:0 0 16px;font-size:16px">${greeting}</p>
        ${bodyHtml}
        ${attachNote}
        <p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px">${footer}</p>
      </div>
    `
  }

  if (settings.templateId === 'branded') {
    return `
      <div style="font-family:Georgia,'Times New Roman',serif;background:#f8fafc;padding:24px 12px">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
          <div style="background:#0f172a;color:#fff;padding:22px 24px">
            <div style="font-size:20px;font-weight:700;letter-spacing:0.04em">GBB Fashion</div>
            <div style="margin-top:4px;font-size:12px;color:#cbd5e1;letter-spacing:0.12em;text-transform:uppercase">Order invoice</div>
          </div>
          <div style="padding:24px;color:#0f172a;line-height:1.55">
            <p style="margin:0 0 16px;font-size:16px">${greeting}</p>
            ${bodyHtml}
            ${attachNote}
          </div>
          <div style="padding:14px 24px;background:#f1f5f9;color:#64748b;font-size:12px">${footer}</div>
        </div>
      </div>
    `
  }

  // classic
  return `
    <div style="font-family:Georgia,'Times New Roman',serif;color:#0f172a;line-height:1.55;max-width:560px;margin:0 auto;padding:8px">
      <div style="height:4px;background:linear-gradient(90deg,#f59e0b,#d97706);border-radius:999px;margin-bottom:20px"></div>
      <p style="margin:0 0 16px;font-size:16px">${greeting}</p>
      ${bodyHtml}
      ${attachNote}
      <p style="margin:24px 0 0;color:#64748b;font-size:13px">${footer}</p>
    </div>
  `
}

export function renderInvoiceEmailText(
  settings: InvoiceEmailSettings,
  vars: InvoiceEmailVars
): string {
  const greeting = applyInvoicePlaceholders(settings.greeting, vars)
  const body = applyInvoicePlaceholders(settings.body, vars)
  const footer = applyInvoicePlaceholders(settings.footerText, vars)
  const parts = [greeting, '', body]
  if (settings.attachPdf && !/attached as a PDF/i.test(body)) {
    parts.push('', 'Your invoice is attached as a PDF.')
  }
  parts.push('', footer)
  return parts.join('\n')
}
