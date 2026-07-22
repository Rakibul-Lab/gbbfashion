import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  RETURN_RECORD_STATUS,
  RETURN_TYPES,
  resolveStatusAfterReturn,
  isReturnType,
} from '@/lib/order-returns'

/** Cancel a pending return/exchange without changing stock. */
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
        { error: 'Only pending returns/exchanges can be cancelled' },
        { status: 400 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      await tx.orderReturn.update({
        where: { id: returnRecord.id },
        data: { status: RETURN_RECORD_STATUS.CANCELLED },
      })

      const completedItems = await tx.orderReturnItem.findMany({
        where: {
          returnRecord: {
            orderId: order.id,
            status: RETURN_RECORD_STATUS.COMPLETED,
          },
        },
        include: { returnRecord: true },
      })

      const totalOrderQty = order.items.reduce((s, i) => s + i.quantity, 0)
      const totalReturnedQty = completedItems.reduce((s, i) => s + i.quantity, 0)

      let nextStatus: string = 'delivered'
      if (totalReturnedQty > 0) {
        const lastType = completedItems[completedItems.length - 1]?.returnRecord?.type
        const type = isReturnType(lastType) ? lastType : RETURN_TYPES.RETURN
        nextStatus = resolveStatusAfterReturn({
          type,
          orderItemQty: totalOrderQty,
          totalReturnedQty,
        })
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
        include: {
          items: true,
          returns: { include: { items: true }, orderBy: { createdAt: 'desc' } },
        },
      })

      return { order: updatedOrder }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Order return cancel error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to cancel return'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
