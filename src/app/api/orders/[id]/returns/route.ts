import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseOrderItemFields } from '@/lib/order-items'
import {
  buildExchangeProductName,
  isReturnType,
  remainingReturnableQty,
  resolveExchangeUnitPrice,
  resolveStatusAfterPendingReturn,
  RETURN_RECORD_STATUS,
  RETURN_TYPES,
} from '@/lib/order-returns'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const returns = await db.orderReturn.findMany({
      where: { orderId: id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(returns)
  } catch (error) {
    console.error('Order returns GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 })
  }
}

/** Create a pending return/exchange — stock & order totals update only after Confirm. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const type = body.type
    if (!isReturnType(type)) {
      return NextResponse.json(
        { error: 'Type must be return or exchange' },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        returns: { include: { items: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        {
          error: 'Return / exchange can only be started from a delivered order',
        },
        { status: 400 }
      )
    }

    const hasPending = order.returns.some(
      (r) => r.status === RETURN_RECORD_STATUS.PENDING
    )
    if (hasPending) {
      return NextResponse.json(
        { error: 'Confirm or cancel the pending return/exchange first' },
        { status: 400 }
      )
    }

    const rawItems = Array.isArray(body.items) ? body.items : []
    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'Select at least one item' }, { status: 400 })
    }

    const priorItems = order.returns.flatMap((r) =>
      r.items.map((item) => ({
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        returnRecord: { status: r.status },
      }))
    )
    const remaining = remainingReturnableQty(order.items, priorItems)

    const productIds = [
      ...new Set(
        order.items
          .map((i) => i.productId)
          .filter((pid): pid is string => Boolean(pid))
      ),
    ]
    const products = productIds.length
      ? await db.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            price: true,
            originalPrice: true,
            galleryImages: true,
            colors: true,
            image: true,
            secondaryImage: true,
          },
        })
      : []
    const productById = new Map(products.map((p) => [p.id, p]))

    type BuiltLine = {
      orderItem: (typeof order.items)[number]
      quantity: number
      exchangeColor: string | null
      exchangeSize: string | null
      exchangeProductName: string | null
      exchangeUnitPrice: number | null
    }

    const built: BuiltLine[] = []

    for (const raw of rawItems) {
      if (!raw || typeof raw !== 'object') continue
      const row = raw as Record<string, unknown>
      const orderItemId = String(row.orderItemId || '')
      const quantity = Math.floor(Number(row.quantity))
      const exchangeColor =
        typeof row.exchangeColor === 'string' && row.exchangeColor.trim()
          ? row.exchangeColor.trim()
          : null
      const exchangeSize =
        typeof row.exchangeSize === 'string' && row.exchangeSize.trim()
          ? row.exchangeSize.trim()
          : null

      const orderItem = order.items.find((i) => i.id === orderItemId)
      if (!orderItem) {
        return NextResponse.json(
          { error: `Order item not found: ${orderItemId}` },
          { status: 400 }
        )
      }
      if (!Number.isFinite(quantity) || quantity < 1) {
        return NextResponse.json(
          { error: `Invalid quantity for ${orderItem.productName}` },
          { status: 400 }
        )
      }
      const maxQty = remaining[orderItemId] ?? 0
      if (quantity > maxQty) {
        return NextResponse.json(
          {
            error: `Only ${maxQty} unit(s) left to return for “${orderItem.productName}”`,
          },
          { status: 400 }
        )
      }

      const parsed = parseOrderItemFields(orderItem)
      const nextColor =
        exchangeColor ??
        (type === RETURN_TYPES.EXCHANGE ? parsed.color || null : null)
      const nextSize =
        exchangeSize ??
        (type === RETURN_TYPES.EXCHANGE ? parsed.size || null : null)

      if (type === RETURN_TYPES.EXCHANGE && (parsed.color || parsed.size)) {
        if (!nextColor && !nextSize) {
          return NextResponse.json(
            { error: `Choose exchange color/size for “${parsed.baseName}”` },
            { status: 400 }
          )
        }
      }

      const product = orderItem.productId
        ? productById.get(orderItem.productId)
        : null
      const exchangeUnitPrice =
        type === RETURN_TYPES.EXCHANGE
          ? resolveExchangeUnitPrice(
              product,
              nextColor,
              nextSize,
              orderItem.price
            )
          : null

      const exchangeProductName =
        type === RETURN_TYPES.EXCHANGE
          ? buildExchangeProductName(
              orderItem.productName,
              nextColor,
              nextSize
            )
          : null

      built.push({
        orderItem,
        quantity,
        exchangeColor: nextColor,
        exchangeSize: nextSize,
        exchangeProductName,
        exchangeUnitPrice,
      })
    }

    if (built.length === 0) {
      return NextResponse.json({ error: 'Select at least one item' }, { status: 400 })
    }

    const reason =
      typeof body.reason === 'string' && body.reason.trim()
        ? body.reason.trim()
        : null
    const notes =
      typeof body.notes === 'string' && body.notes.trim()
        ? body.notes.trim()
        : null
    const restocked = body.restocked !== false
    const refundAmountRaw = Number(body.refundAmount)

    /** Return: refund amount. Exchange: net price adjustment (new − old). */
    const refundAmount =
      type === RETURN_TYPES.RETURN
        ? Number.isFinite(refundAmountRaw) && refundAmountRaw >= 0
          ? Math.round(refundAmountRaw * 100) / 100
          : Math.round(
              built.reduce(
                (sum, line) => sum + line.orderItem.price * line.quantity,
                0
              ) * 100
            ) / 100
        : Math.round(
            built.reduce((sum, line) => {
              const next = line.exchangeUnitPrice ?? line.orderItem.price
              return sum + (next - line.orderItem.price) * line.quantity
            }, 0) * 100
          ) / 100

    const nextPhase = resolveStatusAfterPendingReturn(type)

    const result = await db.$transaction(async (tx) => {
      const created = await tx.orderReturn.create({
        data: {
          orderId: order.id,
          type,
          status: RETURN_RECORD_STATUS.PENDING,
          reason,
          notes,
          refundAmount,
          restocked,
          items: {
            create: built.map((line) => ({
              orderItemId: line.orderItem.id,
              quantity: line.quantity,
              productId: line.orderItem.productId,
              productName: line.orderItem.productName,
              unitPrice: line.orderItem.price,
              exchangeUnitPrice: line.exchangeUnitPrice,
              exchangeProductName: line.exchangeProductName,
              exchangeColor: line.exchangeColor,
              exchangeSize: line.exchangeSize,
            })),
          },
        },
        include: { items: true },
      })

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: nextPhase },
        include: {
          items: true,
          returns: { include: { items: true }, orderBy: { createdAt: 'desc' } },
        },
      })

      return { returnRecord: created, order: updatedOrder }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Order returns POST error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process return'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
