import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { PAYMENT_METHODS, PAYMENT_STATUS } from '@/lib/payment'
import { restoreStockForOrderItems } from '@/lib/order-stock'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        returns: { include: { items: true }, orderBy: { createdAt: 'desc' } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const existing = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const data: {
      status?: string
      paymentStatus?: string
      paidAt?: Date | null
    } = {}

    const nextStatus =
      typeof body.status === 'string' && body.status !== existing.status
        ? body.status
        : null
    if (nextStatus) {
      data.status = nextStatus
    }

    // Explicit admin action: Cash received (COD)
    if (body.paymentStatus === PAYMENT_STATUS.PAID) {
      if (existing.paymentMethod !== PAYMENT_METHODS.COD) {
        return NextResponse.json(
          { error: 'Cash received applies only to Cash on Delivery orders' },
          { status: 400 }
        )
      }
      if (existing.paymentStatus === PAYMENT_STATUS.PAID) {
        return NextResponse.json(
          { error: 'Payment is already marked as paid' },
          { status: 400 }
        )
      }
      data.paymentStatus = PAYMENT_STATUS.PAID
      data.paidAt = new Date()
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(existing)
    }

    const shouldRestore =
      nextStatus === 'cancelled' && existing.status !== 'cancelled'

    const order = await db.$transaction(async (tx) => {
      if (shouldRestore) {
        await restoreStockForOrderItems(
          tx,
          existing.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
          }))
        )
      }
      return tx.order.update({
        where: { id },
        data,
        include: { items: true },
      })
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order PUT error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await db.$transaction(async (tx) => {
      // Already cancelled orders already had stock restored
      if (existing.status !== 'cancelled') {
        await restoreStockForOrderItems(
          tx,
          existing.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
          }))
        )
      }
      await tx.order.delete({ where: { id } })
    })
    return NextResponse.json({ success: true, message: 'Order deleted' })
  } catch (error) {
    console.error('Order DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
