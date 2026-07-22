'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeftRight,
  Loader2,
  PackageOpen,
  RefreshCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { parseOrderItemFields } from '@/lib/order-items'
import {
  remainingReturnableQty,
  resolveExchangeUnitPrice,
  RETURN_REASONS,
  RETURN_TYPES,
  type ReturnType,
} from '@/lib/order-returns'
import {
  colorHasSizes,
  resolveProductColorVariants,
  type ProductColorVariant,
} from '@/lib/product-colors'
import { cn } from '@/lib/utils'

type OrderLine = {
  id: string
  productId?: string | null
  productName: string
  quantity: number
  price: number
}

type ReturnHistoryItem = {
  id: string
  orderItemId: string
  quantity: number
  productName: string
  unitPrice?: number
  exchangeUnitPrice?: number | null
  exchangeProductName?: string | null
  exchangeColor?: string | null
  exchangeSize?: string | null
}

type ReturnHistory = {
  id: string
  type: string
  status: string
  reason?: string | null
  notes?: string | null
  refundAmount: number
  createdAt: string
  items: ReturnHistoryItem[]
}

type ProductSource = {
  id: string
  name: string
  price?: number
  originalPrice?: number | null
  galleryImages?: string | null
  colors?: string | null
  image?: string
  secondaryImage?: string | null
}

export type ReturnExchangeOrder = {
  id: string
  customerName: string
  status: string
  totalAmount: number
  paymentStatus?: string
  items: OrderLine[]
  returns?: ReturnHistory[]
}

type LineDraft = {
  selected: boolean
  quantity: number
  exchangeColor: string
  exchangeSize: string
}

interface OrderReturnExchangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: ReturnExchangeOrder | null
  products?: ProductSource[]
  currencySymbol?: string
  onCompleted: (order: ReturnExchangeOrder) => void
}

function money(amount: number, symbol = '৳') {
  return `${symbol}${Math.round(amount).toLocaleString('en-US')}`
}

export function OrderReturnExchangeDialog({
  open,
  onOpenChange,
  order,
  products = [],
  currencySymbol = '৳',
  onCompleted,
}: OrderReturnExchangeDialogProps) {
  const [type, setType] = useState<ReturnType>(RETURN_TYPES.RETURN)
  const [reason, setReason] = useState<string>(RETURN_REASONS[0])
  const [notes, setNotes] = useState('')
  const [restocked, setRestocked] = useState(true)
  const [refundAmount, setRefundAmount] = useState('')
  const [drafts, setDrafts] = useState<Record<string, LineDraft>>({})
  const [submitting, setSubmitting] = useState(false)

  const remaining = useMemo(() => {
    if (!order) return {} as Record<string, number>
    const prior = (order.returns || []).flatMap((r) =>
      r.items.map((item) => ({
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        returnRecord: { status: r.status },
      }))
    )
    return remainingReturnableQty(order.items, prior)
  }, [order])

  useEffect(() => {
    if (!open || !order) return
    setType(RETURN_TYPES.RETURN)
    setReason(RETURN_REASONS[0])
    setNotes('')
    setRestocked(true)
    const next: Record<string, LineDraft> = {}
    let refund = 0
    for (const item of order.items) {
      const left = remaining[item.id] ?? 0
      const parsed = parseOrderItemFields(item)
      next[item.id] = {
        selected: left > 0 && order.items.length === 1,
        quantity: left > 0 ? Math.min(1, left) : 0,
        exchangeColor: parsed.color || '',
        exchangeSize: parsed.size || '',
      }
      if (left > 0 && order.items.length === 1) {
        refund += item.price * Math.min(1, left)
      }
    }
    setDrafts(next)
    setRefundAmount(String(Math.round(refund)))
  }, [open, order, remaining])

  const selectedLines = useMemo(() => {
    if (!order) return []
    return order.items.filter((item) => {
      const d = drafts[item.id]
      return d?.selected && d.quantity > 0
    })
  }, [order, drafts])

  const productById = useMemo(() => {
    const map = new Map<string, ProductSource>()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  const estimatedRefund = useMemo(() => {
    if (!order) return 0
    return selectedLines.reduce((sum, item) => {
      const qty = drafts[item.id]?.quantity || 0
      return sum + item.price * qty
    }, 0)
  }, [order, selectedLines, drafts])

  const estimatedExchangeAdjustment = useMemo(() => {
    if (!order || type !== RETURN_TYPES.EXCHANGE) return 0
    return selectedLines.reduce((sum, item) => {
      const d = drafts[item.id]
      if (!d) return sum
      const product = item.productId ? productById.get(item.productId) : null
      const nextPrice = resolveExchangeUnitPrice(
        product
          ? {
              price: product.price ?? item.price,
              originalPrice: product.originalPrice ?? null,
              galleryImages: product.galleryImages,
              colors: product.colors,
              image: product.image,
              secondaryImage: product.secondaryImage,
            }
          : null,
        d.exchangeColor || null,
        d.exchangeSize || null,
        item.price
      )
      return sum + (nextPrice - item.price) * d.quantity
    }, 0)
  }, [order, type, selectedLines, drafts, productById])

  useEffect(() => {
    if (type === RETURN_TYPES.RETURN) {
      setRefundAmount(String(Math.round(estimatedRefund)))
    }
  }, [estimatedRefund, type])

  const updateDraft = (itemId: string, patch: Partial<LineDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...patch },
    }))
  }

  const variantsForItem = (item: OrderLine): ProductColorVariant[] => {
    if (!item.productId) return []
    const product = productById.get(item.productId)
    if (!product) return []
    return resolveProductColorVariants({
      ...product,
      image: product.image || '',
    })
  }

  const handleSubmit = async () => {
    if (!order) return
    if (selectedLines.length === 0) {
      toast.error('Select at least one item')
      return
    }

    const items = selectedLines.map((item) => {
      const d = drafts[item.id]
      return {
        orderItemId: item.id,
        quantity: d.quantity,
        exchangeColor:
          type === RETURN_TYPES.EXCHANGE ? d.exchangeColor || null : null,
        exchangeSize:
          type === RETURN_TYPES.EXCHANGE ? d.exchangeSize || null : null,
      }
    })

    if (type === RETURN_TYPES.EXCHANGE) {
      for (const item of selectedLines) {
        const parsed = parseOrderItemFields(item)
        const d = drafts[item.id]
        if ((parsed.color || parsed.size) && !d.exchangeColor && !d.exchangeSize) {
          toast.error(`Choose exchange color/size for “${parsed.baseName}”`)
          return
        }
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          reason,
          notes: notes.trim() || null,
          restocked,
          refundAmount:
            type === RETURN_TYPES.RETURN
              ? Math.round(Number(refundAmount) || estimatedRefund)
              : 0,
          items,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to process')
      toast.success(
        type === RETURN_TYPES.EXCHANGE
          ? 'Exchange submitted — confirm when the swap is done'
          : 'Return submitted — confirm when goods are received'
      )
      onCompleted(data.order)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process')
    } finally {
      setSubmitting(false)
    }
  }

  if (!order) return null

  const history = order.returns || []
  const hasReturnable = order.items.some((i) => (remaining[i.id] ?? 0) > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-0 p-0 overflow-hidden border-slate-200 max-h-[92vh] flex flex-col">
        <div className="h-1 bg-gradient-to-r from-slate-800 via-slate-700 to-amber-600" />

        <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <DialogHeader className="text-left space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
              Delivered order · {order.id.slice(0, 8).toUpperCase()}
            </p>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Return or Exchange
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Process returned goods and optional exchanges. Stock updates automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType(RETURN_TYPES.RETURN)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition',
                type === RETURN_TYPES.RETURN
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <PackageOpen className="h-4 w-4 mb-1" />
              <p className="text-sm font-semibold">Return</p>
              <p className={cn('text-[11px]', type === RETURN_TYPES.RETURN ? 'text-white/70' : 'text-slate-500')}>
                Take back items · refund
              </p>
            </button>
            <button
              type="button"
              onClick={() => setType(RETURN_TYPES.EXCHANGE)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition',
                type === RETURN_TYPES.EXCHANGE
                  ? 'border-amber-700 bg-amber-700 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <ArrowLeftRight className="h-4 w-4 mb-1" />
              <p className="text-sm font-semibold">Exchange</p>
              <p className={cn('text-[11px]', type === RETURN_TYPES.EXCHANGE ? 'text-white/70' : 'text-slate-500')}>
                Swap color / size
              </p>
            </button>
          </div>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1 space-y-4">
          {!hasReturnable ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              All items on this order have already been returned or exchanged.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select items
              </p>
              {order.items.map((item) => {
                const left = remaining[item.id] ?? 0
                const draft = drafts[item.id]
                const parsed = parseOrderItemFields(item)
                const variants = variantsForItem(item)
                const colorVariant =
                  variants.find(
                    (v) =>
                      v.name.toLowerCase() ===
                      (draft?.exchangeColor || parsed.color).toLowerCase()
                  ) || variants[0]
                const sizeOptions =
                  colorVariant && colorHasSizes(colorVariant)
                    ? colorVariant.sizes || []
                    : []
                const disabled = left < 1
                const product = item.productId
                  ? productById.get(item.productId)
                  : null
                const exchangeNextPrice =
                  type === RETURN_TYPES.EXCHANGE && draft?.selected
                    ? resolveExchangeUnitPrice(
                        product
                          ? {
                              price: product.price ?? item.price,
                              originalPrice: product.originalPrice ?? null,
                              galleryImages: product.galleryImages,
                              colors: product.colors,
                              image: product.image,
                              secondaryImage: product.secondaryImage,
                            }
                          : null,
                        draft.exchangeColor || parsed.color || null,
                        draft.exchangeSize || parsed.size || null,
                        item.price
                      )
                    : item.price
                const lineDelta =
                  type === RETURN_TYPES.EXCHANGE && draft?.selected
                    ? (exchangeNextPrice - item.price) * (draft.quantity || 0)
                    : 0

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-xl border p-3 space-y-2.5',
                      disabled
                        ? 'border-slate-100 bg-slate-50 opacity-60'
                        : draft?.selected
                          ? 'border-slate-900/30 bg-slate-50'
                          : 'border-slate-200 bg-white'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={!!draft?.selected}
                        disabled={disabled}
                        onCheckedChange={(v) =>
                          updateDraft(item.id, { selected: v === true })
                        }
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {parsed.baseName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {[parsed.color, parsed.size].filter(Boolean).join(' · ') ||
                            'No variant'}
                          {' · '}
                          {money(item.price, currencySymbol)} each
                          {' · '}
                          {left} of {item.quantity} returnable
                        </p>
                      </div>
                      <div className="w-20 shrink-0">
                        <Label className="text-[10px] text-slate-400">Qty</Label>
                        <Input
                          type="number"
                          min={1}
                          max={left || 1}
                          step={1}
                          disabled={disabled || !draft?.selected}
                          value={draft?.quantity || 1}
                          onChange={(e) => {
                            const n = Math.floor(Number(e.target.value))
                            updateDraft(item.id, {
                              quantity: Math.min(
                                left,
                                Math.max(1, Number.isFinite(n) ? n : 1)
                              ),
                            })
                          }}
                          className="h-8"
                        />
                      </div>
                    </div>

                    {type === RETURN_TYPES.EXCHANGE &&
                      draft?.selected &&
                      !disabled &&
                      variants.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pl-8">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-slate-400">
                              New color
                            </Label>
                            <Select
                              value={draft.exchangeColor || parsed.color || variants[0]?.name}
                              onValueChange={(v) =>
                                updateDraft(item.id, {
                                  exchangeColor: v,
                                  exchangeSize: '',
                                })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Color" />
                              </SelectTrigger>
                              <SelectContent>
                                {variants.map((v) => (
                                  <SelectItem key={v.name} value={v.name}>
                                    {v.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {sizeOptions.length > 0 && (
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-400">
                                New size
                              </Label>
                              <Select
                                value={draft.exchangeSize || sizeOptions[0]?.label || ''}
                                onValueChange={(v) =>
                                  updateDraft(item.id, { exchangeSize: v })
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizeOptions.map((s) => (
                                    <SelectItem key={s.label} value={s.label}>
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="col-span-2 rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-2 text-xs text-amber-950">
                            <span className="text-slate-600">
                              {money(item.price, currencySymbol)}
                            </span>
                            {' → '}
                            <span className="font-semibold">
                              {money(exchangeNextPrice, currencySymbol)}
                            </span>
                            {' each'}
                            {Math.abs(lineDelta) >= 0.01 ? (
                              <span
                                className={
                                  lineDelta > 0
                                    ? ' text-amber-800 font-medium'
                                    : ' text-emerald-700 font-medium'
                                }
                              >
                                {' '}
                                ({lineDelta > 0 ? '+' : ''}
                                {money(lineDelta, currencySymbol)})
                              </span>
                            ) : (
                              <span className="text-slate-500"> · same price</span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {type === RETURN_TYPES.RETURN && (
              <div className="space-y-1.5">
                <Label>Refund amount</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Staff notes for this return / exchange"
              className="min-h-[72px]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <Checkbox
              checked={restocked}
              onCheckedChange={(v) => setRestocked(v === true)}
            />
            Restock returned items into inventory
          </label>

          {history.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Previous returns / exchanges
                </p>
                {history.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          r.type === 'exchange'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }
                      >
                        {r.type}
                      </Badge>
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1">
                      {r.items
                        .map((i) =>
                          i.exchangeProductName
                            ? `${i.productName} → ${i.exchangeProductName} ×${i.quantity}`
                            : `${i.productName} ×${i.quantity}`
                        )
                        .join('; ')}
                    </p>
                    {r.reason ? <p className="text-slate-500">Reason: {r.reason}</p> : null}
                    {r.notes ? (
                      <p className="text-slate-500 mt-0.5 whitespace-pre-wrap">
                        Notes: {r.notes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0 gap-2 sm:gap-2">
          <div className="mr-auto text-xs text-slate-500 hidden sm:block">
            {type === RETURN_TYPES.RETURN
              ? `Refund ≈ ${money(Number(refundAmount) || estimatedRefund, currencySymbol)}`
              : Math.abs(estimatedExchangeAdjustment) < 0.01
                ? 'Order total unchanged'
                : estimatedExchangeAdjustment > 0
                  ? `Order total +${money(estimatedExchangeAdjustment, currencySymbol)}`
                  : `Order total ${money(estimatedExchangeAdjustment, currencySymbol)}`}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting || !hasReturnable || selectedLines.length === 0}
            onClick={() => void handleSubmit()}
            className={
              type === RETURN_TYPES.EXCHANGE
                ? 'bg-amber-700 hover:bg-amber-800 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : type === RETURN_TYPES.EXCHANGE ? (
              <ArrowLeftRight className="h-4 w-4 mr-2" />
            ) : (
              <PackageOpen className="h-4 w-4 mr-2" />
            )}
            {type === RETURN_TYPES.EXCHANGE ? 'Submit exchange' : 'Submit return'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
