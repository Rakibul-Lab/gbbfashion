import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  buildOrderItemProductName,
  parseOrderItemFields,
} from '@/lib/order-items'
import {
  deductStockForOrderItems,
  restoreStockForOrderItems,
} from '@/lib/order-stock'
import {
  RETURN_RECORD_STATUS,
  RETURN_TYPES,
  resolveStatusAfterReturn,
  isReturnType,
  orderTotalFromItems,
} from '@/lib/order-returns'
import { PAYMENT_STATUS } from '@/lib/payment'

/** Confirm a pending return/exchange and apply stock + prices + final status. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; returnId: string }> }
) {
  try {
    const { id, returnId } = await params

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

    const returnRecord = order.returns.find((r) => r.id === returnId)
    if (!returnRecord) {
      return NextResponse.json({ error: 'Return record not found' }, { status: 404 })
    }

    if (returnRecord.status !== RETURN_RECORD_STATUS.PENDING) {
      return NextResponse.json(
        { error: 'Only pending returns/exchanges can be confirmed' },
        { status: 400 }
      )
    }

    if (!isReturnType(returnRecord.type)) {
      return NextResponse.json({ error: 'Invalid return type' }, { status: 400 })
    }

    const type = returnRecord.type
    const previousItems = order.items.map((i) => ({
      price: i.price,
      quantity: i.quantity,
    }))
    const previousTotal = order.totalAmount

    const result = await db.$transaction(async (tx) => {
      if (returnRecord.restocked) {
        await restoreStockForOrderItems(
          tx,
          returnRecord.items.map((line) => ({
            productId: line.productId,
            productName: line.productName,
            quantity: line.quantity,
          }))
        )
      }

      if (type === RETURN_TYPES.EXCHANGE) {
        await deductStockForOrderItems(
          tx,
          returnRecord.items.map((line) => {
            const parsed = parseOrderItemFields({
              productName: line.productName,
              quantity: line.quantity,
              price: line.unitPrice,
            })
            return {
              productId: line.productId,
              productName:
                line.exchangeProductName ||
                buildOrderItemProductName(
                  parsed.baseName,
                  line.exchangeColor,
                  line.exchangeSize
                ),
              quantity: line.quantity,
              color: line.exchangeColor,
              size: line.exchangeSize,
            }
          })
        )

        // Apply new color/size labels + catalog prices onto order lines
        for (const line of returnRecord.items) {
          const orderItem = order.items.find((i) => i.id === line.orderItemId)
          if (!orderItem) continue

          const parsed = parseOrderItemFields(orderItem)
          const nextName =
            line.exchangeProductName ||
            buildOrderItemProductName(
              parsed.baseName,
              line.exchangeColor,
              line.exchangeSize
            )
          const nextPrice =
            typeof line.exchangeUnitPrice === 'number' &&
            Number.isFinite(line.exchangeUnitPrice)
              ? Math.round(line.exchangeUnitPrice * 100) / 100
              : orderItem.price

          if (line.quantity >= orderItem.quantity) {
            await tx.orderItem.update({
              where: { id: orderItem.id },
              data: {
                productName: nextName,
                price: nextPrice,
              },
            })
            orderItem.productName = nextName
            orderItem.price = nextPrice
          } else {
            await tx.orderItem.update({
              where: { id: orderItem.id },
              data: { quantity: orderItem.quantity - line.quantity },
            })
            orderItem.quantity -= line.quantity

            const created = await tx.orderItem.create({
              data: {
                orderId: order.id,
                productId: orderItem.productId,
                productName: nextName,
                quantity: line.quantity,
                price: nextPrice,
              },
            })
            order.items.push(created)
          }
        }
      }

      const completed = await tx.orderReturn.update({
        where: { id: returnRecord.id },
        data: { status: RETURN_RECORD_STATUS.COMPLETED },
        include: { items: true },
      })

      const allReturnItems = await tx.orderReturnItem.findMany({
        where: {
          returnRecord: {
            orderId: order.id,
            status: RETURN_RECORD_STATUS.COMPLETED,
          },
        },
      })
      const totalOrderQty = order.items.reduce((s, i) => s + i.quantity, 0)
      const totalReturnedQty = allReturnItems.reduce((s, i) => s + i.quantity, 0)

      const nextStatus = resolveStatusAfterReturn({
        type,
        orderItemQty: totalOrderQty,
        totalReturnedQty,
      })

      const freshItems = await tx.orderItem.findMany({
        where: { orderId: order.id },
      })
      const nextTotal =
        type === RETURN_TYPES.EXCHANGE
          ? orderTotalFromItems(freshItems, previousTotal, previousItems)
          : previousTotal

      const paymentPatch: { paymentStatus?: string } = {}
      if (type === RETURN_TYPES.RETURN && returnRecord.refundAmount > 0) {
        if (returnRecord.refundAmount >= previousTotal - 0.01) {
          paymentPatch.paymentStatus = 'refunded'
        } else if (order.paymentStatus === PAYMENT_STATUS.PAID) {
          paymentPatch.paymentStatus = 'partial_refund'
        }
      }

      // If exchange increased the unpaid COD total, keep unpaid so staff can collect later if needed
      if (
        type === RETURN_TYPES.EXCHANGE &&
        nextTotal > previousTotal + 0.01 &&
        order.paymentStatus === PAYMENT_STATUS.PAID
      ) {
        // Paid already — total still updates for dashboard; no payment status change
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          totalAmount: nextTotal,
          ...paymentPatch,
        },
        include: {
          items: true,
          returns: { include: { items: true }, orderBy: { createdAt: 'desc' } },
        },
      })

      return { returnRecord: completed, order: updatedOrder }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Order return confirm error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to confirm return'
    const status =
      message.toLowerCase().includes('stock') ||
      message.toLowerCase().includes('insufficient')
        ? 409
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
