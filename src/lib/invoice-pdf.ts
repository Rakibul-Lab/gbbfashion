import PDFDocument from 'pdfkit'
import {
  invoicePaymentNote,
  orderLineSubtotal,
  paymentBalance,
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/lib/payment'

export type InvoicePdfOrderItem = {
  productName: string
  quantity: number
  price: number
}

export type InvoicePdfOrder = {
  id: string
  customerName: string
  customerEmail?: string | null
  customerPhone: string
  shippingAddress?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  totalAmount: number
  status: string
  paymentMethod?: string | null
  paymentStatus?: string | null
  createdAt: Date | string
  items: InvoicePdfOrderItem[]
}

function money(amount: number, symbol = '৳') {
  return `${symbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function formatAddress(order: InvoicePdfOrder) {
  return [
    order.shippingAddress,
    [order.city, order.state].filter(Boolean).join(', '),
    order.zipCode,
  ]
    .filter(Boolean)
    .join('\n')
}

function formatDate(value: Date | string) {
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Build a professional invoice PDF for email attachment */
export async function buildInvoicePdf(
  order: InvoicePdfOrder,
  currencySymbol = '৳'
): Promise<Buffer> {
  const subtotal = orderLineSubtotal(order.items)
  const shipping = Math.max(
    0,
    Math.round((order.totalAmount - subtotal) * 100) / 100
  )
  const { amountPaid, amountDue } = paymentBalance({
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
  })
  const method = paymentMethodLabel(order.paymentMethod)
  const payStatus =
    amountDue > 0 && order.paymentStatus !== 'paid'
      ? 'Due'
      : paymentStatusLabel(order.paymentStatus)
  const note = invoicePaymentNote({
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    amountDue,
    currencySymbol,
  })

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 48,
      info: {
        Title: `Invoice ${order.id}`,
        Author: 'GBB Fashion',
      },
    })
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    let y = doc.page.margins.top

    // Brand
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text('GBB Fashion', 48, y)
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text('6th Floor, RRP Center, Post office More, Ishwardi, Pabna.', 48, y + 20)
      .text('Mobile: 01335-107218 · www.gbbfashion.com', 48, y + 32)

    // Invoice meta (right)
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#64748b')
      .text('INVOICE ID', 48, y, { align: 'right', width: pageWidth })
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#0f172a')
      .text(order.id, 48, y + 14, { align: 'right', width: pageWidth })
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#64748b')
      .text(formatDate(order.createdAt), 48, y + 30, {
        align: 'right',
        width: pageWidth,
      })
      .text(`${order.status.toUpperCase()}  ·  ${payStatus.toUpperCase()}`, 48, y + 42, {
        align: 'right',
        width: pageWidth,
      })

    y += 72
    doc
      .moveTo(48, y)
      .lineTo(48 + pageWidth, y)
      .strokeColor('#0f172a')
      .lineWidth(1)
      .stroke()
    y += 16

    // Parties
    const leftX = 48
    const rightX = 48 + pageWidth / 2 + 12
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text('BILL TO', leftX, y)
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text('SHIP TO', rightX, y)
    y += 14
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#0f172a')
      .text(order.customerName || '—', leftX, y, { width: pageWidth / 2 - 16 })
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(formatAddress(order) || '—', rightX, y, {
        width: pageWidth / 2 - 16,
      })
    const billBlockHeight = doc.heightOfString(
      [order.customerName, order.customerEmail || '', order.customerPhone]
        .filter(Boolean)
        .join('\n'),
      { width: pageWidth / 2 - 16 }
    )
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#475569')
      .text(
        [order.customerEmail || '', order.customerPhone].filter(Boolean).join('\n'),
        leftX,
        y + 14,
        { width: pageWidth / 2 - 16 }
      )

    y += Math.max(billBlockHeight + 18, 52)

    // Table header
    doc
      .moveTo(48, y)
      .lineTo(48 + pageWidth, y)
      .strokeColor('#0f172a')
      .lineWidth(1)
      .stroke()
    y += 8
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b')
    doc.text('NO', 48, y, { width: 28 })
    doc.text('DESCRIPTION', 78, y, { width: 220 })
    doc.text('QTY', 310, y, { width: 40, align: 'right' })
    doc.text('UNIT', 360, y, { width: 70, align: 'right' })
    doc.text('AMOUNT', 440, y, { width: pageWidth - 392, align: 'right' })
    y += 14
    doc
      .moveTo(48, y)
      .lineTo(48 + pageWidth, y)
      .strokeColor('#0f172a')
      .lineWidth(1)
      .stroke()
    y += 6

    doc.font('Helvetica').fontSize(9).fillColor('#0f172a')
    order.items.forEach((item, index) => {
      const rowTop = y
      const nameHeight = doc.heightOfString(item.productName, { width: 220 })
      doc.text(String(index + 1).padStart(2, '0'), 48, rowTop, { width: 28 })
      doc.text(item.productName, 78, rowTop, { width: 220 })
      doc.text(String(item.quantity), 310, rowTop, { width: 40, align: 'right' })
      doc.text(money(item.price, currencySymbol), 360, rowTop, {
        width: 70,
        align: 'right',
      })
      doc.text(money(item.price * item.quantity, currencySymbol), 440, rowTop, {
        width: pageWidth - 392,
        align: 'right',
      })
      y = rowTop + Math.max(nameHeight, 12) + 8
      doc
        .moveTo(48, y)
        .lineTo(48 + pageWidth, y)
        .strokeColor('#e2e8f0')
        .lineWidth(0.5)
        .stroke()
      y += 6
    })

    y += 6
    const summaryRows: Array<[string, string, boolean?]> = [
      ['Subtotal', money(subtotal, currencySymbol)],
      ['Shipping', shipping === 0 ? 'Free' : money(shipping, currencySymbol)],
      ['Grand total', money(order.totalAmount, currencySymbol), true],
      ['Amount paid', money(amountPaid, currencySymbol)],
      ['Payment method', method],
      ['Balance due', money(amountDue, currencySymbol)],
    ]

    for (const [label, value, strong] of summaryRows) {
      if (strong) {
        doc
          .moveTo(48, y)
          .lineTo(48 + pageWidth, y)
          .strokeColor('#0f172a')
          .lineWidth(1)
          .stroke()
        y += 8
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a')
      } else {
        doc.font('Helvetica').fontSize(9).fillColor('#334155')
      }
      doc.text(label, 48, y, { width: pageWidth / 2 })
      doc.text(value, 48, y, { width: pageWidth, align: 'right' })
      y += strong ? 18 : 14
    }

    if (note) {
      y += 10
      doc.roundedRect(48, y, pageWidth, 42, 4).fillAndStroke('#fff7ed', '#fed7aa')
      doc
        .fillColor('#c2410c')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('CASH ON DELIVERY', 56, y + 8)
      doc
        .fillColor('#9a3412')
        .font('Helvetica')
        .fontSize(9)
        .text(note, 56, y + 20, { width: pageWidth - 16 })
      y += 52
    }

    y += 24
    doc
      .moveTo(48 + pageWidth / 2 - 24, y)
      .lineTo(48 + pageWidth / 2 + 24, y)
      .strokeColor('#0f172a')
      .lineWidth(0.8)
      .stroke()
    doc
      .font('Helvetica-Oblique')
      .fontSize(10)
      .fillColor('#334155')
      .text('Thank you for shopping with GBB Fashion', 48, y + 10, {
        width: pageWidth,
        align: 'center',
      })

    doc.end()
  })
}
