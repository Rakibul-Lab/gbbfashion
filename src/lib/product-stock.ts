import {
  parseGalleryImages,
  serializeGalleryImages,
  galleryHasExplicitQuantities,
  colorHasSizes,
  sumColorQuantity,
  sumVariantQuantities,
  type ProductColorVariant,
} from '@/lib/product-colors'
import { inStockFromQuantity, normalizeStock } from '@/lib/stock'

export { sumVariantQuantities }

/** Prefer explicit color; else parse from "Name — Color / Size" or "Name — Color". */
export function resolveOrderItemColor(
  color: string | null | undefined,
  productName: string
): string | null {
  const explicit = typeof color === 'string' ? color.trim() : ''
  if (explicit) return explicit
  const sep = ' — '
  const idx = productName.lastIndexOf(sep)
  if (idx === -1) return null
  const fromName = productName.slice(idx + sep.length).trim()
  if (!fromName) return null
  // "Black / M" → color Black
  const slash = fromName.indexOf(' / ')
  return slash === -1 ? fromName : fromName.slice(0, slash).trim() || null
}

export function resolveOrderItemSize(
  size: string | null | undefined,
  productName: string
): string | null {
  const explicit = typeof size === 'string' ? size.trim() : ''
  if (explicit) return explicit
  const sep = ' — '
  const idx = productName.lastIndexOf(sep)
  if (idx === -1) return null
  const fromName = productName.slice(idx + sep.length).trim()
  const slash = fromName.indexOf(' / ')
  if (slash === -1) return null
  return fromName.slice(slash + 3).trim() || null
}

export type StockApplyResult =
  | {
      ok: true
      stock: number
      inStock: boolean
      galleryImages: string | null
    }
  | { ok: false; error: string }

function findColorIndex(
  variants: ProductColorVariant[],
  color: string | null,
  needQty: number,
  deducting: boolean
): number {
  const colorKey = (color || '').trim().toLowerCase()
  let index = colorKey
    ? variants.findIndex((v) => v.name.trim().toLowerCase() === colorKey)
    : -1

  if (index < 0 && variants.length === 1) index = 0

  if (index < 0) {
    if (deducting) {
      index = variants.findIndex((v) => sumColorQuantity(v) >= needQty)
    } else {
      index = 0
    }
  }
  return index
}

/**
 * Apply a stock delta (negative = deduct, positive = restore) for a product,
 * preferring per-size → per-color quantities in galleryImages when present.
 */
export function applyVariantStockDelta(input: {
  galleryImages: string | null | undefined
  stock: number
  color: string | null
  size?: string | null
  delta: number
  productLabel?: string
}): StockApplyResult {
  const delta = Math.trunc(input.delta)
  if (!delta) {
    return {
      ok: true,
      stock: normalizeStock(input.stock, 0),
      inStock: inStockFromQuantity(normalizeStock(input.stock, 0)),
      galleryImages: input.galleryImages ?? null,
    }
  }

  const variants = parseGalleryImages(input.galleryImages)
  const hasPerColorQty = galleryHasExplicitQuantities(input.galleryImages)

  if (variants.length > 0 && hasPerColorQty) {
    const need = Math.abs(delta)
    const index = findColorIndex(variants, input.color, need, delta < 0)
    if (index < 0) {
      return {
        ok: false,
        error: `${input.productLabel || 'Product'} is out of stock${
          input.color ? ` for ${input.color}` : ''
        }`,
      }
    }

    const variant = variants[index]
    const sizeKey = (input.size || '').trim().toLowerCase()

    if (colorHasSizes(variant)) {
      const sizes = [...(variant.sizes || [])]
      let sizeIndex = sizeKey
        ? sizes.findIndex((s) => s.label.trim().toLowerCase() === sizeKey)
        : -1

      if (sizeIndex < 0 && sizes.length === 1) sizeIndex = 0

      if (sizeIndex < 0 && delta < 0) {
        sizeIndex = sizes.findIndex((s) => normalizeStock(s.quantity, 0) >= need)
      }
      if (sizeIndex < 0 && delta > 0) sizeIndex = 0

      if (sizeIndex < 0) {
        return {
          ok: false,
          error: `${input.productLabel || 'Product'} is out of stock${
            input.size
              ? ` for size ${input.size}`
              : input.color
                ? ` for ${input.color}`
                : ''
          }`,
        }
      }

      const current = normalizeStock(sizes[sizeIndex].quantity, 0)
      const nextQty = current + delta
      if (nextQty < 0) {
        return {
          ok: false,
          error: `Only ${current} left for size ${sizes[sizeIndex].label}${
            variant.name ? ` (${variant.name})` : ''
          } on ${input.productLabel || 'this product'}`,
        }
      }

      sizes[sizeIndex] = { ...sizes[sizeIndex], quantity: nextQty }
      const nextVariant: ProductColorVariant = {
        ...variant,
        sizes,
        quantity: sizes.reduce((sum, s) => sum + normalizeStock(s.quantity, 0), 0),
      }
      const nextVariants = variants.map((v, i) => (i === index ? nextVariant : v))
      const stock = sumVariantQuantities(nextVariants)
      return {
        ok: true,
        stock,
        inStock: inStockFromQuantity(stock),
        galleryImages: serializeGalleryImages(nextVariants),
      }
    }

    const current = normalizeStock(variant.quantity, 0)
    const nextQty = current + delta
    if (nextQty < 0) {
      return {
        ok: false,
        error: `Only ${current} left${
          variant.name ? ` for ${variant.name}` : ''
        } on ${input.productLabel || 'this product'}`,
      }
    }

    const nextVariants = variants.map((v, i) =>
      i === index ? { ...v, quantity: nextQty } : v
    )
    const stock = sumVariantQuantities(nextVariants)
    return {
      ok: true,
      stock,
      inStock: inStockFromQuantity(stock),
      galleryImages: serializeGalleryImages(nextVariants),
    }
  }

  const current = normalizeStock(input.stock, 0)
  const next = current + delta
  if (next < 0) {
    return {
      ok: false,
      error: `Only ${current} left for ${input.productLabel || 'this product'}`,
    }
  }

  return {
    ok: true,
    stock: next,
    inStock: inStockFromQuantity(next),
    galleryImages: input.galleryImages ?? null,
  }
}
