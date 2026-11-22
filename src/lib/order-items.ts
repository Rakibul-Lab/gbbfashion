import {
  resolveOrderItemColor,
  resolveOrderItemSize,
} from '@/lib/product-stock'
import { resolveProductColorVariants } from '@/lib/product-colors'

/** Product name without variant suffix ("Name — Color / Size"). */
export function orderItemBaseName(productName: string): string {
  const sep = ' — '
  const idx = productName.lastIndexOf(sep)
  return idx === -1 ? productName : productName.slice(0, idx).trim()
}

/** Encode variant into stored order line productName (matches checkout). */
export function buildOrderItemProductName(
  baseName: string,
  color?: string | null,
  size?: string | null,
): string {
  const colorPart =
    color && color.trim() && color.trim().toLowerCase() !== 'default'
      ? color.trim()
      : null
  const sizePart = size?.trim() || null
  const suffix = [colorPart, sizePart].filter(Boolean).join(' / ')
  return suffix ? `${baseName} — ${suffix}` : baseName
}

export type ParsedOrderItem = {
  baseName: string
  color: string
  size: string
  quantity: number
  price: number
}

export function parseOrderItemFields(item: {
  productName: string
  quantity: number
  price: number
}): ParsedOrderItem {
  return {
    baseName: orderItemBaseName(item.productName),
    color: resolveOrderItemColor(null, item.productName) || '',
    size: resolveOrderItemSize(null, item.productName) || '',
    quantity: item.quantity,
    price: item.price,
  }
}

export type OrderStockLine = {
  productId: string
  productName: string
  quantity: number
  color: string | null
  size: string | null
}

export function toOrderStockLine(item: {
  productId?: string | null
  productName: string
  quantity: number
  color?: string | null
  size?: string | null
}): OrderStockLine | null {
  if (!item.productId) return null
  return {
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    color: resolveOrderItemColor(item.color, item.productName),
    size: resolveOrderItemSize(item.size, item.productName),
  }
}

export function orderStockLinesEqual(a: OrderStockLine, b: OrderStockLine): boolean {
  return (
    a.productId === b.productId &&
    (a.color || '').toLowerCase() === (b.color || '').toLowerCase() &&
    (a.size || '').toLowerCase() === (b.size || '').toLowerCase() &&
    a.quantity === b.quantity
  )
}

export function orderTotalAfterItemChange(
  items: Array<{ price: number; quantity: number }>,
  previousTotal: number,
  itemIndex: number,
  next: { price: number; quantity: number },
): number {
  const nextItems = items.map((item, i) => (i === itemIndex ? next : item))
  const oldSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const newSubtotal = nextItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = Math.max(0, Math.round((previousTotal - oldSubtotal) * 100) / 100)
  return Math.round((newSubtotal + shipping) * 100) / 100
}

export type ProductImageLookup = {
  id: string
  name?: string
  image: string
  secondaryImage?: string | null
  galleryImages?: string | null
  colors?: string | null
}

/**
 * Resolves the specific color variant image for an order item,
 * falling back to the product's primary image or secondary image.
 */
export function resolveOrderItemImage(
  item: { productId?: string | null; productName: string },
  products: ProductImageLookup[],
): string {
  const color = resolveOrderItemColor(null, item.productName)
  const baseName = orderItemBaseName(item.productName).trim().toLowerCase()

  const product =
    (item.productId ? products.find((p) => p.id === item.productId) : null) ||
    products.find(
      (p) =>
        (p.name && p.name.trim().toLowerCase() === baseName) ||
        (p.name && baseName.includes(p.name.trim().toLowerCase())) ||
        (p.name && p.name.trim().toLowerCase().includes(baseName))
    )

  if (!product) return ''

  if (color) {
    try {
      const variants = resolveProductColorVariants({
        image: product.image,
        secondaryImage: product.secondaryImage,
        galleryImages: product.galleryImages,
        colors: product.colors,
      })
      const colorLower = color.trim().toLowerCase()
      // Clean color from any trailing size in parentheses e.g. "Beige (14)" -> "beige"
      const cleanColor = colorLower.replace(/\s*\(.*?\)\s*/g, '').trim()
      const matched =
        variants.find((v) => v.name && v.name.trim().toLowerCase() === colorLower) ||
        variants.find((v) => v.name && v.name.trim().toLowerCase() === cleanColor) ||
        variants.find(
          (v) =>
            v.name &&
            (cleanColor.includes(v.name.trim().toLowerCase()) ||
              v.name.trim().toLowerCase().includes(cleanColor))
        )
      if (matched?.image?.trim()) {
        return matched.image.trim()
      }
    } catch {
      // ignore variant resolution errors
    }
  }

  return product.image?.trim() || product.secondaryImage?.trim() || ''
}
