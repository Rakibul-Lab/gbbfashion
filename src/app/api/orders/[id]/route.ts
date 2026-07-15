import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { PAYMENT_METHODS, PAYMENT_STATUS } from '@/lib/payment'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
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
    const existing = await db.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const data: {
      status?: string
      paymentStatus?: string
      paidAt?: Date | null
    } = {}

    if (typeof body.status === 'string' && body.status !== existing.status) {
      data.status = body.status
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
      const order = await db.order.findUnique({
        where: { id },
        include: { items: true },
      })
      return NextResponse.json(order)
    }

    const order = await db.order.update({
      where: { id },
      data,
      include: { items: true },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order PUT error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
