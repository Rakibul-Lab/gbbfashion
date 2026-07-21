'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  invoicePaymentNote,
  orderLineSubtotal,
  paymentBalance,
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/lib/payment'

export interface InvoiceOrderItem {
  id: string
  productId?: string | null
  productName: string
  quantity: number
  price: number
}

export interface InvoiceOrder {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress?: string
  city?: string
  state?: string
  zipCode?: string
  totalAmount: number
  status: string
  paymentMethod?: string
  paymentStatus?: string
  sslCardType?: string | null
  sslBankTranId?: string | null
  transactionId?: string | null
  paidAt?: string | null
  items: InvoiceOrderItem[]
  createdAt: string
}

interface OrderInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: InvoiceOrder | null
  logoUrl: string
  currencySymbol?: string
}

function formatMoney(amount: number, symbol = '৳') {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function formatAddress(order: InvoiceOrder) {
  const parts = [
    order.shippingAddress,
    [order.city, order.state].filter(Boolean).join(', '),
    order.zipCode,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join('\n') : '—'
}

function absoluteUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getInvoiceTotals(order: InvoiceOrder) {
  const subtotal = orderLineSubtotal(order.items)
  const shipping = Math.max(
    0,
    Math.round((order.totalAmount - subtotal) * 100) / 100
  )
  const { amountPaid, amountDue } = paymentBalance({
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
  })
  return { subtotal, shipping, amountPaid, amountDue }
}

function buildInvoiceHtml(
  order: InvoiceOrder,
  logoUrl: string,
  currencySymbol: string
) {
  const invoiceDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const logo = absoluteUrl(logoUrl)
  const address = escapeHtml(formatAddress(order)).replace(/\n/g, '<br/>')
  const { subtotal, shipping, amountPaid, amountDue } = getInvoiceTotals(order)
  const method = paymentMethodLabel(order.paymentMethod)
  const payStatus =
    amountDue > 0 && order.paymentStatus !== 'paid'
      ? 'Due'
      : paymentStatusLabel(order.paymentStatus)
  const codNote = invoicePaymentNote({
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    amountDue,
    currencySymbol,
  })
  const fulfillment =
    order.status.charAt(0).toUpperCase() + order.status.slice(1)

  const rows = order.items
    .map(
      (item, index) => `
      <tr>
        <td class="idx">${String(index + 1).padStart(2, '0')}</td>
        <td class="item">${escapeHtml(item.productName)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${escapeHtml(formatMoney(item.price, currencySymbol))}</td>
        <td class="num amount">${escapeHtml(
          formatMoney(item.price * item.quantity, currencySymbol)
        )}</td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(order.id)} — GBB Fashion</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "DM Sans", "Segoe UI", sans-serif;
      color: #0f172a;
      background: #fff;
      font-size: 13px;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page { max-width: 800px; margin: 0 auto; padding: 36px 40px 44px; }
    .top { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
    .brand { display: flex; gap: 12px; align-items: flex-start; }
    .brand img { width: 40px; height: 40px; object-fit: contain; }
    .brand-name {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 18px; font-weight: 600; color: #0f172a;
    }
    .brand-details { margin-top: 6px; font-size: 11px; line-height: 1.45; color: #475569; }
    .invoice-meta { text-align: right; }
    .invoice-label {
      font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
      color: #64748b; font-weight: 600;
    }
    .invoice-id {
      margin-top: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px; font-weight: 600; letter-spacing: -0.02em;
    }
    .invoice-date { margin-top: 3px; font-size: 11px; color: #64748b; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; margin-top: 8px; }
    .badge {
      display: inline-block; font-size: 10px; font-weight: 600;
      letter-spacing: 0.04em; text-transform: uppercase;
      padding: 3px 7px; border-radius: 999px; border: 1px solid #e2e8f0; color: #334155;
    }
    .badge.paid { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
    .badge.due { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
    .rule { height: 1px; background: #0f172a; margin: 0 0 18px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 18px; }
    .party-label {
      font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
      color: #64748b; font-weight: 600; margin-bottom: 6px;
    }
    .party-name {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 15px; font-weight: 600; margin-bottom: 2px;
    }
    .party-line { color: #475569; font-size: 12px; margin-top: 1px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    thead th {
      text-align: left; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
      color: #64748b; font-weight: 600; padding: 0 6px 8px; border-bottom: 1px solid #0f172a;
    }
    thead th.num { text-align: right; }
    thead th.idx { width: 36px; }
    tbody td {
      padding: 8px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; color: #0f172a;
    }
    tbody td.idx { color: #64748b; font-size: 11px; font-variant-numeric: tabular-nums; }
    tbody td.item { font-weight: 500; font-size: 12.5px; }
    tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
    tbody td.amount { font-weight: 600; }
    .summary {
      width: 100%;
      padding-top: 2px;
    }
    .sum-row {
      display: flex; justify-content: space-between; align-items: baseline;
      padding: 5px 0; font-size: 12.5px; color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    .sum-row:last-child { border-bottom: none; }
    .sum-row.total {
      margin-top: 2px; padding-top: 8px; border-top: 1.5px solid #0f172a;
      border-bottom: 1px solid #e2e8f0;
      color: #0f172a; font-weight: 700;
    }
    .sum-row.total .val {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 18px; font-weight: 700;
    }
    .sum-row.due { color: #c2410c; font-weight: 700; }
    .sum-row.paid { color: #047857; font-weight: 600; }
    .sum-row.method { color: #0f172a; }
    .cod-note {
      margin-top: 16px; padding: 10px 12px;
      border: 1px solid #fed7aa; background: #fff7ed;
      font-size: 12px; color: #9a3412; line-height: 1.45;
    }
    .cod-note strong {
      display: block; margin-bottom: 2px; font-size: 10px;
      letter-spacing: 0.14em; text-transform: uppercase; color: #c2410c;
    }
    .thanks { margin-top: 28px; text-align: center; }
    .thanks-line { width: 40px; height: 1px; background: #0f172a; margin: 0 auto 10px; }
    .thanks p {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 14px; font-style: italic; color: #334155;
    }
    @media print {
      @page { margin: 12mm; size: A4; }
      .page { padding: 18px 20px 28px; max-width: none; }
    }
    @media (max-width: 640px) {
      .page { padding: 28px 20px; }
      .parties { grid-template-columns: 1fr; }
      .top { flex-direction: column; }
      .invoice-meta { text-align: left; }
      .badge-row { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div class="brand">
        <img src="${escapeHtml(logo)}" alt="GBB Fashion" />
        <div>
          <div class="brand-name">GBB Fashion</div>
          <div class="brand-details">
            6th Floor, RRP Center, Post office More, Ishwardi, Pabna.<br/>
            Mobile: 01335-107218<br/>
            www.gbbfashion.com
          </div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-label">Invoice ID</div>
        <div class="invoice-id">${escapeHtml(order.id)}</div>
        <div class="invoice-date">${escapeHtml(invoiceDate)}</div>
        <div class="badge-row">
          <span class="badge">${escapeHtml(fulfillment)}</span>
          <span class="badge ${amountDue > 0 ? 'due' : 'paid'}">${escapeHtml(payStatus)}</span>
        </div>
      </div>
    </div>
    <div class="rule"></div>
    <div class="parties">
      <div>
        <div class="party-label">Bill to</div>
        <div class="party-name">${escapeHtml(order.customerName || '—')}</div>
        <div class="party-line">${escapeHtml(order.customerEmail || '')}</div>
        <div class="party-line">${escapeHtml(order.customerPhone || '')}</div>
      </div>
      <div>
        <div class="party-label">Ship to</div>
        <div class="party-line" style="white-space:pre-line;margin-top:2px">${address}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="idx">No</th>
          <th>Description</th>
          <th class="num">Qty</th>
          <th class="num">Unit</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="summary">
      <div class="sum-row">
        <span>Subtotal</span>
        <span>${escapeHtml(formatMoney(subtotal, currencySymbol))}</span>
      </div>
      <div class="sum-row">
        <span>Shipping</span>
        <span>${
          shipping === 0
            ? 'Free'
            : escapeHtml(formatMoney(shipping, currencySymbol))
        }</span>
      </div>
      <div class="sum-row total">
        <span>Grand total</span>
        <span class="val">${escapeHtml(formatMoney(order.totalAmount, currencySymbol))}</span>
      </div>
      <div class="sum-row paid">
        <span>Amount paid</span>
        <span>${escapeHtml(formatMoney(amountPaid, currencySymbol))}</span>
      </div>
      <div class="sum-row method">
        <span>Payment method</span>
        <span>${escapeHtml(method)}</span>
      </div>
      <div class="sum-row due">
        <span>Balance due</span>
        <span>${escapeHtml(formatMoney(amountDue, currencySymbol))}</span>
      </div>
    </div>

    ${
      codNote
        ? `<div class="cod-note"><strong>Cash on Delivery</strong>${escapeHtml(codNote)}</div>`
        : ''
    }

    <div class="thanks">
      <div class="thanks-line"></div>
      <p>Thank you for shopping with GBB Fashion</p>
    </div>
  </div>
</body>
</html>`
}

function printInvoiceHtml(html: string) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'Print invoice')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    const win = window.open('', '_blank', 'width=900,height=1100')
    if (!win) {
      alert('Please allow pop-ups to print the invoice.')
      return
    }
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  const win = iframe.contentWindow
  if (!win) {
    document.body.removeChild(iframe)
    return
  }

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe)
    }, 600)
  }

  const doPrint = () => {
    try {
      win.focus()
      win.print()
    } finally {
      cleanup()
    }
  }

  const images = Array.from(doc.images)
  if (images.length === 0) {
    setTimeout(doPrint, 200)
    return
  }

  let remaining = images.length
  let printed = false
  const done = () => {
    remaining -= 1
    if (remaining <= 0 && !printed) {
      printed = true
      setTimeout(doPrint, 150)
    }
  }
  images.forEach((img) => {
    if (img.complete) done()
    else {
      img.addEventListener('load', done)
      img.addEventListener('error', done)
    }
  })
  setTimeout(() => {
    if (!printed) {
      printed = true
      doPrint()
    }
  }, 1800)
}

export function OrderInvoiceDialog({
  open,
  onOpenChange,
  order,
  logoUrl,
  currencySymbol = '৳',
}: OrderInvoiceDialogProps) {
  const handlePrint = useCallback(() => {
    if (!order) return
    printInvoiceHtml(buildInvoiceHtml(order, logoUrl, currencySymbol))
  }, [order, logoUrl, currencySymbol])

  const totals = useMemo(
    () => (order ? getInvoiceTotals(order) : null),
    [order]
  )

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  if (!open || !order || !totals || typeof document === 'undefined') return null

  const invoiceDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const { subtotal, shipping, amountPaid, amountDue } = totals
  const payStatusBadge =
    amountDue > 0 && order.paymentStatus !== 'paid'
      ? 'Due'
      : paymentStatusLabel(order.paymentStatus)
  const codNote = invoicePaymentNote({
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    amountDue,
    currencySymbol,
  })

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f5f5f4]">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 bg-[#fafaf9]/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div className="h-4 w-px bg-stone-300" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400 font-medium">
              Invoice
            </p>
            <p className="text-sm text-stone-800 font-medium truncate font-mono tracking-tight">
              {order.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none border-stone-300 text-stone-700 hover:bg-stone-100"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-none bg-stone-900 hover:bg-stone-800 text-stone-50"
            onClick={handlePrint}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Save PDF
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[880px] px-4 py-8 sm:px-8 sm:py-10">
          <article className="relative bg-white shadow-[0_1px_3px_rgba(28,25,23,0.06),0_24px_48px_-12px_rgba(28,25,23,0.12)]">
            <div className="px-7 py-8 sm:px-12 sm:py-10 text-slate-900">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between pb-5 border-b border-slate-900">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="GBB Fashion"
                    className="h-10 w-10 object-contain shrink-0 mt-0.5"
                  />
                  <div>
                    <h1
                      className="text-base sm:text-lg font-semibold tracking-tight"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      GBB Fashion
                    </h1>
                    <div className="mt-1.5 text-[11px] leading-snug text-slate-600">
                      <p>6th Floor, RRP Center, Post office More, Ishwardi, Pabna.</p>
                      <p>Mobile: 01335-107218</p>
                      <p>www.gbbfashion.com</p>
                    </div>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500 font-semibold">
                    Invoice ID
                  </p>
                  <p className="mt-1 text-sm font-semibold tracking-tight font-mono">
                    {order.id}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{invoiceDate}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2 sm:justify-end">
                    <span className="inline-flex rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      {order.status}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        amountDue > 0
                          ? 'border-orange-200 bg-orange-50 text-orange-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {payStatusBadge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500 font-semibold mb-2">
                    Bill to
                  </p>
                  <p
                    className="text-[15px] font-semibold"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {order.customerName || '—'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{order.customerEmail}</p>
                  <p className="text-sm text-slate-600">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500 font-semibold mb-2">
                    Ship to
                  </p>
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-snug">
                    {formatAddress(order)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-900">
                      <th className="text-left py-2 pr-2 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold w-10">
                        No
                      </th>
                      <th className="text-left py-2 px-2 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
                        Description
                      </th>
                      <th className="text-right py-2 px-2 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
                        Qty
                      </th>
                      <th className="text-right py-2 px-2 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
                        Unit
                      </th>
                      <th className="text-right py-2 pl-2 text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-slate-200">
                        <td className="py-2.5 pr-2 text-xs text-slate-500 tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2.5 px-2 text-sm font-medium">
                          {item.productName}
                        </td>
                        <td className="py-2.5 px-2 text-right text-sm tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-2 text-right text-sm tabular-nums">
                          {formatMoney(item.price, currencySymbol)}
                        </td>
                        <td className="py-2.5 pl-2 text-right text-sm font-semibold tabular-nums">
                          {formatMoney(item.price * item.quantity, currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-1 w-full pt-1">
                <div className="flex justify-between items-baseline text-sm text-slate-600 py-1.5 border-b border-slate-100">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {formatMoney(subtotal, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm text-slate-600 py-1.5 border-b border-slate-100">
                  <span>Shipping</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {shipping === 0 ? 'Free' : formatMoney(shipping, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-t border-slate-900 pt-2.5 mt-0.5 pb-1.5 border-b border-slate-100">
                  <span className="text-sm font-bold">Grand total</span>
                  <span
                    className="text-base font-bold tabular-nums"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {formatMoney(order.totalAmount, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm text-emerald-700 font-semibold py-1.5 border-b border-slate-100">
                  <span>Amount paid</span>
                  <span className="tabular-nums">
                    {formatMoney(amountPaid, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm text-slate-800 py-1.5 border-b border-slate-100">
                  <span>Payment method</span>
                  <span className="font-medium text-right">
                    {paymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm text-orange-700 font-bold py-1.5">
                  <span>Balance due</span>
                  <span className="tabular-nums">
                    {formatMoney(amountDue, currencySymbol)}
                  </span>
                </div>
              </div>

              {codNote ? (
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-900">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-orange-700 mb-0.5">
                    Cash on Delivery
                  </p>
                  <p className="leading-snug">{codNote}</p>
                </div>
              ) : null}

              <div className="mt-10 pt-4 text-center">
                <div className="mx-auto mb-3 h-px w-10 bg-slate-900" />
                <p
                  className="text-[15px] italic text-slate-700"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Thank you for shopping with GBB Fashion
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>,
    document.body
  )
}
