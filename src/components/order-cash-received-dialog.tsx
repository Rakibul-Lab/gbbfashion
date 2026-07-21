'use client'

import { Banknote, CheckCircle2, Loader2, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { InvoiceOrder } from '@/components/order-invoice'
import {
  orderLineSubtotal,
  paymentBalance,
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/lib/payment'

function formatMoney(amount: number, symbol = '৳') {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

interface OrderCashReceivedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: InvoiceOrder | null
  currencySymbol?: string
  confirming?: boolean
  onConfirm: () => void
}

export function OrderCashReceivedDialog({
  open,
  onOpenChange,
  order,
  currencySymbol = '৳',
  confirming = false,
  onConfirm,
}: OrderCashReceivedDialogProps) {
  if (!order) return null

  const subtotal = orderLineSubtotal(order.items)
  const shipping = Math.max(0, Math.round((order.totalAmount - subtotal) * 100) / 100)
  const { amountDue } = paymentBalance({
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
  })
  const cashAmount = amountDue > 0 ? amountDue : order.totalAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-0 p-0 overflow-hidden border-slate-200">
        <div className="h-1 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500" />

        <div className="px-5 pt-4 pb-2">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
                  Cash on delivery
                </p>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Confirm cash received
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Mark paid after collecting cash from the customer.
                </DialogDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0 text-[10px]">
                {paymentMethodLabel(order.paymentMethod)}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 pb-2 space-y-2.5">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 text-slate-700">
              <User className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span className="font-semibold truncate">{order.customerName}</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px] shrink-0">{order.id}</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-3.5 text-center">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 mb-2">
              <Banknote className="h-4 w-4" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-700/80 font-medium">
              Cash amount received
            </p>
            <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight mt-0.5">
              {formatMoney(cashAmount, currencySymbol)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Status: {paymentStatusLabel(order.paymentStatus)}
            </p>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white px-3 py-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="tabular-nums text-slate-900">
                {formatMoney(subtotal, currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shipping</span>
              <span className="tabular-nums text-slate-900">
                {formatMoney(shipping, currencySymbol)}
              </span>
            </div>
            <Separator className="my-0.5" />
            <div className="flex justify-between font-semibold">
              <span className="text-slate-900">Order total</span>
              <span className="tabular-nums text-slate-900">
                {formatMoney(order.totalAmount, currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Amount to record</span>
              <span className="tabular-nums">{formatMoney(cashAmount, currencySymbol)}</span>
            </div>
          </section>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg h-8"
            disabled={confirming}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white min-w-[160px] h-8"
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Confirm cash received
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
