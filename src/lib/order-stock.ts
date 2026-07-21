import { db } from '@/lib/db'
import {
  applyVariantStockDelta,
  resolveOrderItemColor,
  resolveOrderItemSize,
} from '@/lib/product-stock'

type StockLine = {
  productId: string
  productName: string
  quantity: number
  color?: string | null
  size?: string | null
}

function toStockLines(
  lines: {
    productId?: string | null
    productName: string
    quantity: number
    color?: string | null
    size?: string | null
  }[]
): StockLine[] {
  const out: StockLine[] = []
  for (const line of lines) {
    if (!line.productId) continue
    out.push({
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity,
      color: line.color,
      size: line.size,
    })
  }
  return out
}

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0]

async function applyLines(
  tx: TxClient,
  lines: StockLine[],
  direction: 'deduct' | 'restore'
) {
  const aggregated = new Map<string, StockLine>()
  for (const line of lines) {
    const color = resolveOrderItemColor(line.color, line.productName)
    const size = resolveOrderItemSize(line.size, line.productName)
    const key = `${line.productId}::${(color || '').toLowerCase()}::${(size || '').toLowerCase()}`
    const existing = aggregated.get(key)
    if (existing) {
      existing.quantity += line.quantity
    } else {
      aggregated.set(key, {
        productId: line.productId,
        productName: line.productName,
        quantity: line.quantity,
        color,
        size,
      })
    }
  }

  for (const line of aggregated.values()) {
    const product = await tx.product.findUnique({
      where: { id: line.productId },
      select: {
        id: true,
        name: true,
        stock: true,
        galleryImages: true,
      },
    })
    if (!product) {
      throw new Error(`Product not found: ${line.productName || line.productId}`)
    }

    const delta =
      direction === 'deduct' ? -Math.abs(line.quantity) : Math.abs(line.quantity)
    const result = applyVariantStockDelta({
      galleryImages: product.galleryImages,
      stock: product.stock,
      color: line.color ?? null,
      size: line.size ?? null,
      delta,
      productLabel: product.name,
    })

    if (!result.ok) {
      throw new Error(result.error)
    }

    await tx.product.update({
      where: { id: product.id },
      data: {
        stock: result.stock,
        inStock: result.inStock,
        galleryImages: result.galleryImages,
      },
    })
  }
}

/** Deduct inventory for order lines (throws on insufficient stock). */
export async function deductStockForOrderItems(
  tx: TxClient,
  lines: {
    productId?: string | null
    productName: string
    quantity: number
    color?: string | null
    size?: string | null
  }[]
) {
  await applyLines(tx, toStockLines(lines), 'deduct')
}

/** Restore inventory when an order is cancelled or deleted. */
export async function restoreStockForOrderItems(
  tx: TxClient,
  lines: {
    productId?: string | null
    productName: string
    quantity: number
    color?: string | null
    size?: string | null
  }[]
) {
  await applyLines(tx, toStockLines(lines), 'restore')
}
