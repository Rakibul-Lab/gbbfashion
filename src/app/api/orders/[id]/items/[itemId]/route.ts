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
