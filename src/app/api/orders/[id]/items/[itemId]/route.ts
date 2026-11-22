import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  buildOrderItemProductName,
  orderItemBaseName,
  orderStockLinesEqual,
  orderTotalAfterItemChange,
  parseOrderItemFields,
  toOrderStockLine,
} from '@/lib/order-items'
import {
  deductStockForOrderItems,
  restoreStockForOrderItems,
} from '@/lib/order-stock'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ItemPatchBody = {
  color?: unknown
  size?: unknown
  quantity?: unknown
  price?: unknown
}

function parsePatch(body: ItemPatchBody) {
  const color = typeof body.color === 'string' ? body.color.trim() : undefined
  const size = typeof body.size === 'string' ? body.size.trim() : undefined
  const quantity = Number(body.quantity)
  const price = Number(body.price)

  if (body.quantity !== undefined) {
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
      return { error: 'Quantity must be a whole number of at least 1' as const }
    }
  }
  if (body.price !== undefined) {
    if (!Number.isFinite(price) || price < 0) {
      return { error: 'Price must be zero or greater' as const }
    }
  }

  return {
    color,
    size,
    quantity: body.quantity !== undefined ? Math.floor(quantity) : undefined,
    price: body.price !== undefined ? Math.round(price * 100) / 100 : undefined,
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const { id: orderId, itemId } = await params
    const body = (await request.json()) as ItemPatchBody
    const patch = parsePatch(body)

    if ('error' in patch) {
      return NextResponse.json({ error: patch.error }, { status: 400 })
    }

    if (
      patch.color === undefined &&
      patch.size === undefined &&
      patch.quantity === undefined &&
      patch.price === undefined
    ) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending orders can be edited' },
        { status: 400 },
      )
    }

    const itemIndex = order.items.findIndex((row) => row.id === itemId)
    if (itemIndex < 0) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 })
    }

    const existing = order.items[itemIndex]
    const parsed = parseOrderItemFields(existing)
    const baseName = orderItemBaseName(existing.productName)

    const nextColor = patch.color !== undefined ? patch.color : parsed.color
    const nextSize = patch.size !== undefined ? patch.size : parsed.size
    const nextQuantity = patch.quantity ?? parsed.quantity
    const nextPrice = patch.price ?? parsed.price
    const nextProductName = buildOrderItemProductName(baseName, nextColor, nextSize)

    const oldStockLine = toOrderStockLine({
      productId: existing.productId,
      productName: existing.productName,
      quantity: existing.quantity,
    })
    const newStockLine = toOrderStockLine({
      productId: existing.productId,
      productName: nextProductName,
      quantity: nextQuantity,
      color: nextColor || null,
      size: nextSize || null,
    })

    const stockChanged =
      oldStockLine &&
      newStockLine &&
      !orderStockLinesEqual(oldStockLine, newStockLine)

    const nextTotal = orderTotalAfterItemChange(
      order.items,
      order.totalAmount,
      itemIndex,
      { price: nextPrice, quantity: nextQuantity },
    )

    const updated = await db.$transaction(async (tx) => {
      if (stockChanged && oldStockLine && newStockLine) {
        await restoreStockForOrderItems(tx, [oldStockLine])
        await deductStockForOrderItems(tx, [newStockLine])
      }

      await tx.orderItem.update({
        where: { id: itemId },
        data: {
          productName: nextProductName,
          quantity: nextQuantity,
          price: nextPrice,
        },
      })

      return tx.order.update({
        where: { id: orderId },
        data: { totalAmount: nextTotal },
        include: { items: true },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update order item'
    if (
      message.toLowerCase().includes('stock') ||
      message.toLowerCase().includes('left') ||
      message.toLowerCase().includes('not found')
    ) {
      return NextResponse.json({ error: message }, { status: 409 })
    }
    console.error('Order item PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update order item' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const { id: orderId, itemId } = await params
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status !== 'pending' && order.status !== 'processing') {
      return NextResponse.json(
        { error: 'Only pending or processing orders can be modified' },
        { status: 400 },
      )
    }

    const itemIndex = order.items.findIndex((row) => row.id === itemId)
    if (itemIndex < 0) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 })
    }

    const existingItem = order.items[itemIndex]
    const stockLine = toOrderStockLine({
      productId: existingItem.productId,
      productName: existingItem.productName,
      quantity: existingItem.quantity,
    })

    // If this is the only item in the order, cancelling the item cancels the whole order
    if (order.items.length === 1) {
      const updated = await db.$transaction(async (tx) => {
        if (stockLine) {
          await restoreStockForOrderItems(tx, [stockLine])
        }
        await tx.orderItem.delete({ where: { id: itemId } })
        return tx.order.update({
          where: { id: orderId },
          data: { status: 'cancelled', totalAmount: 0 },
          include: { items: true },
        })
      })
      return NextResponse.json(updated)
    }

    // Multiple items: restore stock for this item, delete it, and recalculate new order total
    const remainingItems = order.items.filter((i) => i.id !== itemId)
    const oldSubtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const newSubtotal = remainingItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const shipping = Math.max(0, Math.round((order.totalAmount - oldSubtotal) * 100) / 100)
    const nextTotal = Math.round((newSubtotal + shipping) * 100) / 100

    const updated = await db.$transaction(async (tx) => {
      if (stockLine) {
        await restoreStockForOrderItems(tx, [stockLine])
      }
      await tx.orderItem.delete({ where: { id: itemId } })
      return tx.order.update({
        where: { id: orderId },
        data: { totalAmount: nextTotal },
        include: { items: true },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Order item DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete order item' }, { status: 500 })
  }
}
