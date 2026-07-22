import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createUniqueOrderId } from '@/lib/order-id'
import {
  isPaymentMethod,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  type PaymentMethod,
} from '@/lib/payment'
import {
  buildProductName,
  getAppBaseUrl,
  initSslCommerzPayment,
  resolveHostedGatewayUrl,
} from '@/lib/sslcommerz'
import { getSiteSettings } from '@/lib/site-settings'
import { sendOrderInvoiceEmail } from '@/lib/order-invoice-mail'
import {
  deductStockForOrderItems,
  restoreStockForOrderItems,
} from '@/lib/order-stock'

type OrderItemInput = {
  productId: string
  productName: string
  quantity: number
  price: number
  color?: string | null
  size?: string | null
}

function parseItems(raw: unknown): OrderItemInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const items: OrderItemInput[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null
    const row = item as Record<string, unknown>
    const productId = typeof row.productId === 'string' ? row.productId : ''
    const productName = typeof row.productName === 'string' ? row.productName : ''
    const quantity = Number(row.quantity)
    const price = Number(row.price)
    const color =
      typeof row.color === 'string' && row.color.trim()
        ? row.color.trim()
        : null
    const size =
      typeof row.size === 'string' && row.size.trim()
        ? row.size.trim()
        : null
    if (!productId || !productName || !Number.isFinite(quantity) || quantity < 1) {
      return null
    }
    if (!Number.isFinite(price) || price < 0) return null
    items.push({
      productId,
      productName,
      quantity: Math.floor(quantity),
      price,
      color,
      size,
    })
  }
  return items
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mine = searchParams.get('mine') === '1'

    if (mine) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const orders = await db.order.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            ...(session.user.email
              ? [{ customerEmail: session.user.email }]
              : []),
          ],
        },
        include: {
          items: true,
          returns: { include: { items: true }, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(orders)
    }

    const orders = await db.order.findMany({
      include: {
        items: true,
        returns: { include: { items: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = await getServerSession(authOptions)

    const customerName = String(body.customerName || '').trim()
    const customerEmailRaw = String(body.customerEmail || '').trim()
    const customerPhone = String(body.customerPhone || '').trim()
    const shippingAddress = String(body.shippingAddress || '').trim()
    const city = String(body.city || '').trim()
    const state = String(body.state || '').trim()
    const zipCode = String(body.zipCode || '').trim()
    const items = parseItems(body.items)

    if (
      !customerName ||
      !customerPhone ||
      !shippingAddress ||
      !city ||
      !state ||
      !items
    ) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 })
    }

    if (customerEmailRaw && !isValidEmail(customerEmailRaw)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const emailNormalized = customerEmailRaw ? customerEmailRaw.toLowerCase() : ''

    if (session?.user?.id && emailNormalized) {
      const existingUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { email: true },
      })
      if (existingUser && emailNormalized !== existingUser.email.toLowerCase()) {
        const taken = await db.user.findUnique({
          where: { email: emailNormalized },
          select: { id: true },
        })
        if (taken && taken.id !== session.user.id) {
          return NextResponse.json(
            { error: 'That email is already used by another account' },
            { status: 409 }
          )
        }
      }
    }

    const paymentMethod: PaymentMethod = isPaymentMethod(body.paymentMethod)
      ? body.paymentMethod
      : PAYMENT_METHODS.COD

    const settings = await getSiteSettings()
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping =
      subtotal >= settings.freeDeliveryMin ? 0 : settings.deliveryCharge
    const totalAmount = Math.round((subtotal + shipping) * 100) / 100

    const clientTotal = Number(body.totalAmount)
    if (
      Number.isFinite(clientTotal) &&
      Math.abs(clientTotal - totalAmount) > 1
    ) {
      console.warn('Order total mismatch (using server total)', {
        clientTotal,
        totalAmount,
      })
    }

    const orderId = await createUniqueOrderId()
    const isOnline = paymentMethod === PAYMENT_METHODS.SSLCOMMERZ

    let order
    try {
      order = await db.$transaction(async (tx) => {
        await deductStockForOrderItems(
          tx,
          items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          }))
        )

        return tx.order.create({
          data: {
            id: orderId,
            userId: session?.user?.id ?? null,
            customerName,
            customerEmail: emailNormalized,
            customerPhone,
            shippingAddress,
            city,
            state,
            zipCode,
            totalAmount,
            status: 'pending',
            paymentMethod,
            paymentStatus: isOnline ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.UNPAID,
            transactionId: isOnline ? orderId : null,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: { items: true },
        })
      })
    } catch (stockError) {
      const message =
        stockError instanceof Error ? stockError.message : 'Insufficient stock'
      if (
        message.toLowerCase().includes('stock') ||
        message.toLowerCase().includes('left') ||
        message.toLowerCase().includes('not found')
      ) {
        return NextResponse.json({ error: message }, { status: 409 })
      }
      throw stockError
    }

    if (session?.user?.id) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          name: customerName,
          ...(emailNormalized ? { email: emailNormalized } : {}),
          phone: customerPhone || null,
          shippingAddress: shippingAddress || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
        },
      })
    }

    // Order is saved first and returned to the customer immediately.
    // Invoice email runs in the background via SMTP_HOST (sapphire.premium.hostns.io).
    // If SMTP connects → invoice is emailed. If not → order still succeeds.
    let invoiceEmailQueued = false
    if (emailNormalized) {
      invoiceEmailQueued = true
      void sendOrderInvoiceEmail({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        city: order.city,
        state: order.state,
        zipCode: order.zipCode,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      })
        .then((mailResult) => {
          if (!mailResult.ok) {
            console.warn('[orders] invoice email skipped (order still complete):', mailResult.reason)
          } else {
            console.info('[orders] invoice email sent:', order.id)
          }
        })
        .catch((mailError) => {
          console.error('[orders] invoice email error (order still complete):', mailError)
        })
    }

    if (!isOnline) {
      return NextResponse.json(
        {
          order,
          payment: {
            method: PAYMENT_METHODS.COD,
            status: PAYMENT_STATUS.UNPAID,
          },
          invoiceEmailSent: false,
          invoiceEmailQueued,
        },
        { status: 201 }
      )
    }

    const baseUrl = getAppBaseUrl(request.url)
    const sslPayload = {
      total_amount: totalAmount,
      currency: 'BDT',
      tran_id: order.id,
      success_url: `${baseUrl}/api/payments/sslcommerz/success`,
      fail_url: `${baseUrl}/api/payments/sslcommerz/fail`,
      cancel_url: `${baseUrl}/api/payments/sslcommerz/cancel`,
      ipn_url: `${baseUrl}/api/payments/sslcommerz/ipn`,
      shipping_method: 'Courier',
      num_of_item: order.items.reduce((n, i) => n + i.quantity, 0) || 1,
      product_name: buildProductName(order.items),
      product_category: 'fashion',
      product_profile: 'general',
      cus_name: customerName,
      cus_email: emailNormalized || 'guest@gbbfashion.com',
      cus_add1: shippingAddress,
      cus_city: city,
      cus_state: state,
      cus_postcode: zipCode,
      cus_country: 'Bangladesh',
      cus_phone: customerPhone,
      ship_name: customerName,
      ship_add1: shippingAddress,
      ship_city: city,
      ship_state: state,
      ship_postcode: zipCode,
      ship_country: 'Bangladesh',
      value_a: order.id,
      value_b: paymentMethod,
    }

    let gatewayUrl: string | undefined
    try {
      const sslRes = await initSslCommerzPayment(sslPayload)
      gatewayUrl = resolveHostedGatewayUrl(sslRes)

      if (!gatewayUrl || (sslRes.status || '').toUpperCase() !== 'SUCCESS') {
        console.error('SSLCommerz init failed:', sslRes)
        await db.$transaction(async (tx) => {
          await restoreStockForOrderItems(
            tx,
            order.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
            }))
          )
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PAYMENT_STATUS.FAILED,
              status: 'cancelled',
              paymentMeta: JSON.stringify(sslRes),
            },
          })
        })
        return NextResponse.json(
          {
            error:
              sslRes.failedreason ||
              'Could not initialize SSLCommerz payment session',
            orderId: order.id,
          },
          { status: 502 }
        )
      }

      await db.order.update({
        where: { id: order.id },
        data: {
          paymentMeta: JSON.stringify({
            sessionkey: sslRes.sessionkey,
            GatewayPageURL: gatewayUrl,
          }),
        },
      })
    } catch (error) {
      console.error('SSLCommerz init exception:', error)
      await db.$transaction(async (tx) => {
        await restoreStockForOrderItems(
          tx,
          order.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
          }))
        )
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PAYMENT_STATUS.FAILED,
            status: 'cancelled',
            paymentMeta: JSON.stringify({
              error: error instanceof Error ? error.message : 'init failed',
            }),
          },
        })
      })
      return NextResponse.json(
        { error: 'Payment gateway unavailable', orderId: order.id },
        { status: 502 }
      )
    }

    return NextResponse.json(
      {
        order,
        payment: {
          method: PAYMENT_METHODS.SSLCOMMERZ,
          status: PAYMENT_STATUS.PENDING,
          gatewayUrl,
        },
        invoiceEmailQueued,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
