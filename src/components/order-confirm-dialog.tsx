'use client'

import { useCallback, useEffect, useMemo, useState, type FocusEvent, type MouseEvent } from 'react'
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Save,
  User,
  X,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { InvoiceOrder } from '@/components/order-invoice'
import { orderItemBaseName, parseOrderItemFields } from '@/lib/order-items'
import { parseGalleryImages } from '@/lib/product-colors'
import {
  orderLineSubtotal,
  paymentBalance,
  paymentMethodLabel,
  paymentStatusLabel,
} from '@/lib/payment'
import { toast } from 'sonner'

type ProductVariantSource = {
  id: string
  galleryImages: string | null
}

type ItemDraft = {
  color: string
  size: string
  quantity: string
  price: string
}

function formatAddress(order: InvoiceOrder) {
  const parts = [
    order.shippingAddress,
    [order.city, order.state].filter(Boolean).join(', '),
    order.zipCode,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : '—'
}

function formatMoney(amount: number, symbol = '৳') {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function draftFromItem(item: InvoiceOrder['items'][number]): ItemDraft {
  const parsed = parseOrderItemFields(item)
  return {
    color: parsed.color,
    size: parsed.size,
    quantity: String(parsed.quantity),
    price: String(Math.round(parsed.price)),
  }
}

function draftsEqual(a: ItemDraft, b: ItemDraft) {
  return (
    a.color === b.color &&
    a.size === b.size &&
    a.quantity === b.quantity &&
    a.price === b.price
  )
}

function sanitizeIntegerInput(raw: string): string {
  if (raw === '') return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return String(parseInt(digits, 10))
}

function parseIntegerField(value: string, fallback = 0): number {
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function focusNumericInputEnd(e: FocusEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>) {
  const el = e.currentTarget
  // number inputs throw if setSelectionRange is used
  if (el.type === 'number') return
  requestAnimationFrame(() => {
    try {
      const len = el.value.length
      el.setSelectionRange(len, len)
    } catch {
      // ignore unsupported selection types
    }
  })
}

interface OrderConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: InvoiceOrder | null
  products?: ProductVariantSource[]
  currencySymbol?: string
  confirming?: boolean
  onConfirm: () => void
  onOrderUpdated?: (order: InvoiceOrder) => void
}

export function OrderConfirmDialog({
  open,
  onOpenChange,
  order,
  products = [],
  currencySymbol = '৳',
  confirming = false,
  onConfirm,
  onOrderUpdated,
}: OrderConfirmDialogProps) {
  const [localOrder, setLocalOrder] = useState<InvoiceOrder | null>(order)
  const [editingRows, setEditingRows] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({})
  const [savedDrafts, setSavedDrafts] = useState<Record<string, ItemDraft>>({})
  const [savingItemId, setSavingItemId] = useState<string | null>(null)

  useEffect(() => {
    if (!order) {
      setLocalOrder(null)
      setEditingRows({})
      setDrafts({})
      setSavedDrafts({})
      return
    }
    setLocalOrder(order)
    const next: Record<string, ItemDraft> = {}
    for (const item of order.items) {
      next[item.id] = draftFromItem(item)
    }
    setDrafts(next)
    setSavedDrafts(next)
    setEditingRows({})
  }, [order])

  const productMap = useMemo(() => {
    const map = new Map<string, ProductVariantSource>()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(editingRows).some((id) => {
      if (!editingRows[id]) return false
      return savedDrafts[id] && drafts[id] && !draftsEqual(drafts[id], savedDrafts[id])
    })
  }, [drafts, savedDrafts, editingRows])

  const updateDraft = useCallback((itemId: string, patch: Partial<ItemDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...patch },
    }))
  }, [])

  const startEditRow = (itemId: string) => {
    const item = localOrder?.items.find((row) => row.id === itemId)
    if (!item) return
    const draft = draftFromItem(item)
    setDrafts((prev) => ({ ...prev, [itemId]: draft }))
    setSavedDrafts((prev) => ({ ...prev, [itemId]: draft }))
    setEditingRows((prev) => ({ ...prev, [itemId]: true }))
  }

  const cancelEditRow = (itemId: string) => {
    const saved = savedDrafts[itemId]
    if (saved) {
      setDrafts((prev) => ({ ...prev, [itemId]: { ...saved } }))
    }
    setEditingRows((prev) => ({ ...prev, [itemId]: false }))
  }

  const handleSaveItem = async (itemId: string) => {
    if (!localOrder) return
    const draft = drafts[itemId]
    if (!draft) return

    const quantity = parseIntegerField(draft.quantity)
    const price = parseIntegerField(draft.price)
    if (!draft.quantity.trim() || quantity < 1) {
      toast.error('Quantity must be a whole number of at least 1')
      return
    }
    if (!draft.price.trim() || price < 0) {
      toast.error('Enter a valid whole-number price')
      return
    }

    setSavingItemId(itemId)
    try {
      const res = await fetch(`/api/orders/${localOrder.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: draft.color,
          size: draft.size,
          quantity,
          price,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to save item')
      }

      setLocalOrder(data)
      const refreshed: Record<string, ItemDraft> = {}
      for (const item of data.items) {
        refreshed[item.id] = draftFromItem(item)
      }
      setDrafts((prev) => ({ ...prev, ...refreshed }))
      setSavedDrafts((prev) => ({ ...prev, ...refreshed }))
      setEditingRows((prev) => ({ ...prev, [itemId]: false }))
      onOrderUpdated?.(data)
      toast.success('Item saved — product stock updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSavingItemId(null)
    }
  }

  if (!localOrder) return null

  const subtotal = orderLineSubtotal(localOrder.items)
  const shipping = Math.max(0, Math.round((localOrder.totalAmount - subtotal) * 100) / 100)
  const { amountDue } = paymentBalance({
    totalAmount: localOrder.totalAmount,
    paymentStatus: localOrder.paymentStatus,
  })
  const orderDate = new Date(localOrder.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const anyRowEditing = Object.values(editingRows).some(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl gap-0 p-0 overflow-hidden border-slate-200 max-h-[90vh] flex flex-col">
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shrink-0" />

        <div className="px-5 pt-4 pb-2 shrink-0">
          <DialogHeader className="text-left space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
                  Review order
                </p>
                <DialogTitle className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                  {localOrder.id}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Turn on Edit for only the products you need to change, then Save each row.
                </DialogDescription>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 shrink-0 text-[10px]">
                Pending
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 pb-2 space-y-2.5 flex-1 min-h-0 overflow-y-auto max-h-[min(42vh,340px)]">
          <div className="grid sm:grid-cols-2 gap-2">
            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700">
                <User className="h-3.5 w-3.5 text-emerald-700" />
                <h3 className="text-xs font-semibold">Customer</h3>
              </div>
              <div className="text-xs leading-snug">
                <p className="font-medium text-slate-900">{localOrder.customerName}</p>
                <p className="text-slate-600">{localOrder.customerEmail || '—'}</p>
                <p className="text-slate-600">{localOrder.customerPhone}</p>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                <h3 className="text-xs font-semibold">Shipping</h3>
              </div>
              <p className="text-xs text-slate-600 leading-snug line-clamp-3">
                {formatAddress(localOrder)}
              </p>
            </section>
          </div>

          <section className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200">
              <Package className="h-3.5 w-3.5 text-emerald-700" />
              <h3 className="text-xs font-semibold text-slate-800">
                Items ({localOrder.items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="h-8 min-w-[110px] text-xs">Product</TableHead>
                    <TableHead className="h-8 min-w-[88px] text-xs">Color</TableHead>
                    <TableHead className="h-8 w-12 text-xs">Size</TableHead>
                    <TableHead className="h-8 w-11 text-xs text-right">Qty</TableHead>
                    <TableHead className="h-8 min-w-[96px] text-xs text-right">Price</TableHead>
                    <TableHead className="h-8 w-[76px] text-xs text-right">Total</TableHead>
                    <TableHead className="h-8 w-[118px] text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localOrder.items.map((item) => {
                    const isEditing = !!editingRows[item.id]
                    const draft = drafts[item.id] ?? draftFromItem(item)
                    const saved = savedDrafts[item.id] ?? draftFromItem(item)
                    const isDirty = isEditing && !draftsEqual(draft, saved)
                    const parsed = parseOrderItemFields(item)
                    const product = item.productId
                      ? productMap.get(item.productId)
                      : undefined
                    const variants = product
                      ? parseGalleryImages(product.galleryImages)
                      : []
                    const colorOptions = variants.map((v) => v.name)
                    const selectedVariant = variants.find(
                      (v) => v.name.toLowerCase() === draft.color.trim().toLowerCase(),
                    )
                    const sizeOptions = (selectedVariant?.sizes || []).map((s) => s.label)
                    const colorInOptions =
                      colorOptions.length > 0 &&
                      colorOptions.some(
                        (name) =>
                          name.toLowerCase() === draft.color.trim().toLowerCase(),
                      )
                    const sizeInOptions =
                      sizeOptions.length > 0 &&
                      sizeOptions.some(
                        (label) =>
                          label.toLowerCase() === draft.size.trim().toLowerCase(),
                      )
                    const useColorSelect =
                      colorOptions.length > 0 &&
                      (colorInOptions || !draft.color.trim())
                    const useSizeSelect =
                      sizeOptions.length > 0 &&
                      (sizeInOptions || !draft.size.trim())
                    const qty = isEditing ? parseIntegerField(draft.quantity) : item.quantity
                    const unitPrice = isEditing ? parseIntegerField(draft.price) : Math.round(item.price)
                    const lineTotal = qty * unitPrice

                    return (
                      <TableRow key={item.id} className="hover:bg-transparent">
                        <TableCell className="py-1.5 text-xs font-medium text-slate-900 align-middle">
                          <span
                            className="line-clamp-2"
                            title={orderItemBaseName(item.productName)}
                          >
                            {orderItemBaseName(item.productName)}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 align-middle">
                          {isEditing ? (
                            colorOptions.length > 0 && useColorSelect ? (
                              <Select
                                value={draft.color || undefined}
                                onValueChange={(value) =>
                                  updateDraft(item.id, { color: value, size: '' })
                                }
                              >
                                <SelectTrigger className="h-7 text-xs min-w-[84px]">
                                  <SelectValue placeholder="Color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colorOptions.map((name) => (
                                    <SelectItem key={name} value={name} className="text-xs">
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={draft.color}
                                onChange={(e) =>
                                  updateDraft(item.id, { color: e.target.value })
                                }
                                className="h-7 text-xs min-w-[84px]"
                                placeholder="Color"
                              />
                            )
                          ) : (
                            <span className="text-xs text-slate-600">
                              {parsed.color || '—'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 align-middle w-12">
                          {isEditing ? (
                            sizeOptions.length > 0 && useSizeSelect ? (
                              <Select
                                value={draft.size || undefined}
                                onValueChange={(value) =>
                                  updateDraft(item.id, { size: value })
                                }
                              >
                                <SelectTrigger className="h-7 w-12 px-1.5 text-xs">
                                  <SelectValue placeholder="Sz" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizeOptions.map((label) => (
                                    <SelectItem key={label} value={label} className="text-xs">
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={draft.size}
                                onChange={(e) =>
                                  updateDraft(item.id, { size: e.target.value })
                                }
                                className="h-7 w-12 min-w-12 px-1.5 text-xs"
                                placeholder="Sz"
                              />
                            )
                          ) : (
                            <span className="text-xs text-slate-600">{parsed.size || '—'}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 align-middle text-right w-11">
                          {isEditing ? (
                            <div className="flex justify-end">
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={draft.quantity}
                                onChange={(e) =>
                                  updateDraft(item.id, {
                                    quantity: sanitizeIntegerInput(e.target.value),
                                  })
                                }
                                onFocus={focusNumericInputEnd}
                                onClick={focusNumericInputEnd}
                                className="h-7 w-11 min-w-11 px-1.5 text-right text-end tabular-nums"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-slate-700 tabular-nums">
                              {item.quantity}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 align-middle text-right min-w-[96px]">
                          {isEditing ? (
                            <div className="flex justify-end">
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={draft.price}
                                onChange={(e) =>
                                  updateDraft(item.id, {
                                    price: sanitizeIntegerInput(e.target.value),
                                  })
                                }
                                onFocus={focusNumericInputEnd}
                                onClick={focusNumericInputEnd}
                                className="h-7 w-full min-w-[96px] max-w-[140px] px-2 text-right text-end tabular-nums"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-slate-600 tabular-nums">
                              {formatMoney(Math.round(item.price), currencySymbol)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs font-semibold text-slate-900 text-right tabular-nums align-middle">
                          {formatMoney(lineTotal, currencySymbol)}
                        </TableCell>
                        <TableCell className="py-1.5 text-right align-middle">
                          {isEditing ? (
                            <div className="inline-flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-1.5 text-[10px] rounded-md"
                                disabled={savingItemId === item.id || confirming}
                                onClick={() => cancelEditRow(item.id)}
                                title="Cancel edit"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={isDirty ? 'default' : 'outline'}
                                className={`h-7 px-2 text-[10px] rounded-md ${
                                  isDirty
                                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                    : ''
                                }`}
                                disabled={!isDirty || savingItemId === item.id || confirming}
                                onClick={() => void handleSaveItem(item.id)}
                              >
                                {savingItemId === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Save className="h-3 w-3 mr-0.5" />
                                    Save
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[10px] rounded-md"
                              disabled={confirming || savingItemId !== null}
                              onClick={() => startEditRow(item.id)}
                            >
                              <Pencil className="h-3 w-3 mr-0.5" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            {anyRowEditing && hasUnsavedChanges ? (
              <p className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 border-t border-amber-100">
                Save each edited product before confirming the order.
              </p>
            ) : null}
          </section>

          <div className="grid sm:grid-cols-2 gap-2">
            <section className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <CreditCard className="h-3.5 w-3.5 text-emerald-700" />
                <h3 className="font-semibold">Payment</h3>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-medium text-slate-900">
                  {paymentMethodLabel(localOrder.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-slate-900">
                  {paymentStatusLabel(localOrder.paymentStatus)}
                </span>
              </div>
              {amountDue > 0 && localOrder.paymentStatus !== 'paid' ? (
                <div className="flex justify-between">
                  <span className="text-slate-500">Due</span>
                  <span className="font-semibold text-orange-600 tabular-nums">
                    {formatMoney(amountDue, currencySymbol)}
                  </span>
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                <h3 className="font-semibold">Summary</h3>
              </div>
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
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900 tabular-nums">
                  {formatMoney(localOrder.totalAmount, currencySymbol)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Placed {orderDate}</p>
            </section>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 sm:justify-between shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg h-8"
            disabled={confirming || savingItemId !== null}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white min-w-[140px] h-8"
            disabled={confirming || hasUnsavedChanges || savingItemId !== null}
            onClick={onConfirm}
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
