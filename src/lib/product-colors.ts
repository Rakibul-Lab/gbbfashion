import { normalizeStock } from '@/lib/stock'

export type VariantPricingMode = 'base' | 'custom'

/** Size option with its own stock, nested under a color */
export type ProductSizeStock = {
  label: string
  /** Units for this size — undefined = empty in admin until set */
  quantity?: number
  /** base = inherit color pricing; custom = use price / originalPrice below */
  pricingMode?: VariantPricingMode
  price?: number
  /** Compare-at — null = no strike-through for this variant */
  originalPrice?: number | null
}

/** Color + image variant used for gallery / homepage swatches */
export type ProductColorVariant = {
  name: string
  swatch: string
  image: string
  /**
   * Units for this color when no sizes are defined.
   * When `sizes` exist, this equals the sum of size quantities.
   */
  quantity?: number
  /** base = inherit product price / compare-at; custom = use price / originalPrice below */
  pricingMode?: VariantPricingMode
  price?: number
  originalPrice?: number | null
  sizes?: ProductSizeStock[]
}

function parseMoney(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
    return Math.round(raw * 100) / 100
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed * 100) / 100
    }
  }
  return undefined
}

function parseCompareAt(raw: unknown): number | null | undefined {
  if (raw === null) return null
  return parseMoney(raw)
}

function parsePricingMode(
  row: Record<string, unknown>,
  hasLegacyCustomPrice: boolean
): VariantPricingMode {
  if (row.pricingMode === 'custom') return 'custom'
  if (row.pricingMode === 'base') return 'base'
  return hasLegacyCustomPrice ? 'custom' : 'base'
}

function readVariantPricing(row: Record<string, unknown>) {
  const price = parseMoney(row.price)
  const originalPrice = parseCompareAt(row.originalPrice ?? row.compareAtPrice)
  const hasLegacyCustomPrice =
    price !== undefined || originalPrice !== undefined || originalPrice === null
  const pricingMode = parsePricingMode(row, hasLegacyCustomPrice)
  return {
    pricingMode,
    ...(pricingMode === 'custom'
      ? {
          ...(price !== undefined ? { price } : {}),
          ...(originalPrice !== undefined ? { originalPrice } : {}),
        }
      : {}),
  }
}

export type ProductMediaInput = {
  image: string
  secondaryImage?: string | null
  galleryImages?: string | null
  colors?: string | null
}

const COLOR_NAME_SWATCHES: Record<string, string> = {
  black: '#111111',
  white: '#f5f5f5',
  cream: '#f5f0e6',
  beige: '#d4c4a8',
  brown: '#6b4423',
  tan: '#c8a882',
  navy: '#1a2744',
  blue: '#3b82f6',
  red: '#b91c1c',
  rose: '#e11d48',
  pink: '#ec4899',
  green: '#166534',
  olive: '#6b7c3c',
  grey: '#6b7280',
  gray: '#6b7280',
  silver: '#c0c0c0',
  gold: '#c9a66b',
  yellow: '#eab308',
  orange: '#ea580c',
  purple: '#7c3aed',
  maroon: '#7f1d1d',
}

/** Suggested size chips in admin (admin can still type custom labels) */
export const SUGGESTED_SIZE_LABELS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  'One Size',
] as const

export function swatchForColorName(name: string, fallback = '#888888'): string {
  const key = name.trim().toLowerCase()
  if (COLOR_NAME_SWATCHES[key]) return COLOR_NAME_SWATCHES[key]
  for (const [token, hex] of Object.entries(COLOR_NAME_SWATCHES)) {
    if (key.includes(token)) return hex
  }
  return fallback
}

function parseSizeRows(raw: unknown): ProductSizeStock[] {
  if (!Array.isArray(raw)) return []
  const out: ProductSizeStock[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const label =
      typeof row.label === 'string'
        ? row.label.trim()
        : typeof row.size === 'string'
          ? row.size.trim()
          : typeof row.name === 'string'
            ? row.name.trim()
            : ''
    if (!label) continue
    const qtyRaw = row.quantity ?? row.stock ?? row.qty
    let quantity: number | undefined
    if (typeof qtyRaw === 'number' && Number.isFinite(qtyRaw)) {
      quantity = Math.max(0, Math.floor(qtyRaw))
    } else if (typeof qtyRaw === 'string' && qtyRaw.trim() !== '') {
      quantity = Math.max(0, Math.floor(Number(qtyRaw)) || 0)
    }
    const price = parseMoney(row.price)
    const originalPrice = parseCompareAt(row.originalPrice ?? row.compareAtPrice)
    const pricingMode = parsePricingMode(
      row,
      price !== undefined || originalPrice !== undefined || originalPrice === null
    )
    out.push({
      label,
      pricingMode,
      ...(quantity !== undefined ? { quantity } : {}),
      ...(pricingMode === 'custom'
        ? {
            ...(price !== undefined ? { price } : {}),
            ...(originalPrice !== undefined ? { originalPrice } : {}),
          }
        : {}),
    })
  }
  return out
}

export function colorHasSizes(variant: ProductColorVariant | null | undefined): boolean {
  return Boolean(variant?.sizes && variant.sizes.length > 0)
}

/** Total units for one color (sizes sum, else color quantity). */
export function sumColorQuantity(variant: ProductColorVariant): number {
  if (colorHasSizes(variant)) {
    return (variant.sizes || []).reduce(
      (sum, s) => sum + normalizeStock(s.quantity, 0),
      0
    )
  }
  return normalizeStock(variant.quantity, 0)
}

export function sumVariantQuantities(variants: ProductColorVariant[]): number {
  return variants.reduce((sum, v) => sum + sumColorQuantity(v), 0)
}

export function getSizeQuantity(
  variant: ProductColorVariant | null | undefined,
  sizeLabel: string | null | undefined
): number {
  if (!variant || !sizeLabel?.trim()) return 0
  const key = sizeLabel.trim().toLowerCase()
  const size = (variant.sizes || []).find((s) => s.label.trim().toLowerCase() === key)
  return normalizeStock(size?.quantity, 0)
}

export function parseGalleryImages(raw: string | null | undefined): ProductColorVariant[] {
  if (!raw?.trim()) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      return parsed
        .map((item): ProductColorVariant | null => {
          if (!item || typeof item !== 'object') return null
          const row = item as Record<string, unknown>
          const name = typeof row.name === 'string' ? row.name.trim() : ''
          const swatch = typeof row.swatch === 'string' ? row.swatch.trim() : '#888888'
          const image =
            typeof row.image === 'string'
              ? row.image.trim()
              : typeof row.thumbnail === 'string'
                ? row.thumbnail.trim()
                : ''
          if (!name && !image) return null

          const sizes = parseSizeRows(row.sizes)
          const qtyRaw = row.quantity ?? row.stock ?? row.qty
          let quantity: number | undefined
          if (typeof qtyRaw === 'number' && Number.isFinite(qtyRaw)) {
            quantity = Math.max(0, Math.floor(qtyRaw))
          } else if (typeof qtyRaw === 'string' && qtyRaw.trim() !== '') {
            quantity = Math.max(0, Math.floor(Number(qtyRaw)) || 0)
          }

          if (sizes.length > 0) {
            quantity = sizes.reduce((sum, s) => sum + normalizeStock(s.quantity, 0), 0)
          } else if (quantity === undefined) {
            quantity = 0
          }

          const pricing = readVariantPricing(row)

          return {
            name: name || 'Color',
            swatch: swatch || '#888888',
            image,
            quantity,
            ...pricing,
            ...(sizes.length > 0 ? { sizes } : {}),
          }
        })
        .filter((v): v is ProductColorVariant => v !== null)
    }
  } catch {
    // fall through — legacy comma-separated colors
  }

  return raw.split(',').map((part, index) => {
    const value = part.trim()
    const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
    return {
      name: isHex ? `Color ${index + 1}` : value || `Color ${index + 1}`,
      swatch: isHex ? value : swatchForColorName(value),
      image: '',
      quantity: 0,
    }
  })
}

export function serializeGalleryImages(variants: ProductColorVariant[]): string | null {
  const cleaned = variants
    .map((v) => {
      const sizes = (v.sizes || [])
        .map((s) => {
          const mode = s.pricingMode === 'custom' ? 'custom' : 'base'
          const row: Record<string, unknown> = {
            label: s.label.trim(),
            quantity: Math.max(0, Math.floor(normalizeStock(s.quantity, 0))),
            pricingMode: mode,
          }
          if (mode === 'custom') {
            if (typeof s.price === 'number' && Number.isFinite(s.price)) {
              row.price = Math.round(s.price * 100) / 100
            }
            if (s.originalPrice !== undefined) {
              row.originalPrice = s.originalPrice
            }
          }
          return row
        })
        .filter((s) => typeof s.label === 'string' && s.label)

      const quantity =
        sizes.length > 0
          ? sizes.reduce((sum, s) => sum + (s.quantity as number), 0)
          : Math.max(
              0,
              Math.floor(
                typeof v.quantity === 'number' ? v.quantity : Number(v.quantity) || 0
              )
            )

      const mode = v.pricingMode === 'custom' ? 'custom' : 'base'
      const row: Record<string, unknown> = {
        name: v.name.trim() || 'Color',
        swatch: v.swatch.trim() || '#888888',
        image: v.image.trim(),
        quantity,
        pricingMode: mode,
        ...(sizes.length > 0 ? { sizes } : {}),
      }
      if (mode === 'custom') {
        if (typeof v.price === 'number' && Number.isFinite(v.price)) {
          row.price = Math.round(v.price * 100) / 100
        }
        if (v.originalPrice !== undefined) {
          row.originalPrice = v.originalPrice
        }
      }
      return row
    })
    .filter((v) => v.image || v.name)
  if (!cleaned.length) return null
  return JSON.stringify(cleaned)
}

/** True when gallery JSON already stores per-color quantity fields. */
export function galleryHasExplicitQuantities(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return false
    return parsed.some((item) => {
      if (!item || typeof item !== 'object') return false
      const row = item as Record<string, unknown>
      return (
        row.quantity !== undefined ||
        row.stock !== undefined ||
        row.qty !== undefined ||
        (Array.isArray(row.sizes) && row.sizes.length > 0)
      )
    })
  } catch {
    return false
  }
}

/** True when any color in gallery has a sizes array. */
export function galleryHasSizes(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return false
    return parsed.some((item) => {
      if (!item || typeof item !== 'object') return false
      const row = item as Record<string, unknown>
      return Array.isArray(row.sizes) && row.sizes.length > 0
    })
  } catch {
    return false
  }
}

export function colorNamesFromGallery(variants: ProductColorVariant[]): string | null {
  const names = variants.map((v) => v.name.trim()).filter(Boolean)
  return names.length ? names.join(',') : null
}

/**
 * Resolve color options for a product — always returns at least one variant
 * so storefront color selection can always render.
 */
export function resolveProductColorVariants(product: ProductMediaInput): ProductColorVariant[] {
  const primary = product.image?.trim() || ''
  const secondary = product.secondaryImage?.trim() || ''

  const fromGallery = parseGalleryImages(product.galleryImages)
    .map((v) => ({
      ...v,
      image: v.image || primary,
      swatch: v.swatch || swatchForColorName(v.name),
      quantity: sumColorQuantity(v),
    }))
    .filter((v) => v.image)

  if (fromGallery.length > 0) return fromGallery

  const legacyNames = (product.colors || '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)

  if (legacyNames.length > 0 && primary) {
    return legacyNames.map((name, index) => ({
      name,
      swatch: swatchForColorName(name),
      image: index === 0 ? primary : secondary || primary,
    }))
  }

  const fallback: ProductColorVariant[] = []
  if (primary) {
    fallback.push({
      name: 'Default',
      swatch: '#1f2937',
      image: primary,
    })
  }
  if (secondary && secondary !== primary) {
    fallback.push({
      name: 'Alternate',
      swatch: '#94a3b8',
      image: secondary,
    })
  }
  return fallback.length
    ? fallback
    : [{ name: 'Default', swatch: '#1f2937', image: primary || '/placeholder.png' }]
}

/** Unique product images for the gallery strip (angles + color photos). */
export function resolveProductGallery(
  product: ProductMediaInput,
  selectedColor?: string | null
): string[] {
  const variants = resolveProductColorVariants(product)
  const selected = selectedColor
    ? variants.find((v) => v.name.toLowerCase() === selectedColor.toLowerCase())
    : null

  const ordered: string[] = []
  const push = (url?: string | null) => {
    const value = url?.trim()
    if (!value) return
    if (!ordered.includes(value)) ordered.push(value)
  }

  if (selected?.image) push(selected.image)
  push(product.image)
  push(product.secondaryImage)
  for (const v of variants) push(v.image)

  return ordered
}

/**
 * Product detail gallery: color photos only (no featured/main image) when colors exist.
 * Falls back to featured + secondary when the product has no color variants.
 */
export function resolveProductDetailGallery(
  product: ProductMediaInput,
  selectedColor?: string | null
): string[] {
  const variants = resolveProductColorVariants(product)
  const ordered: string[] = []
  const push = (url?: string | null) => {
    const value = url?.trim()
    if (!value) return
    if (!ordered.includes(value)) ordered.push(value)
  }

  if (variants.length === 0) {
    push(product.image)
    push(product.secondaryImage)
    return ordered
  }

  const selected = selectedColor
    ? variants.find((v) => v.name.toLowerCase() === selectedColor.toLowerCase())
    : null

  if (selected?.image) push(selected.image)
  for (const v of variants) push(v.image)
  // Secondary angle is allowed if it isn't the same as the featured listing shot only used elsewhere
  if (product.secondaryImage && product.secondaryImage !== product.image) {
    push(product.secondaryImage)
  }

  return ordered
}

export function cartLineKey(
  productId: string,
  color?: string | null,
  size?: string | null
): string {
  return `${productId}::${(color || '').trim().toLowerCase()}::${(size || '').trim().toLowerCase()}`
}

/** Build display suffix for cart / order line titles */
export function formatVariantSuffix(
  color?: string | null,
  size?: string | null
): string {
  const parts: string[] = []
  if (color?.trim() && color.trim() !== 'Default') parts.push(color.trim())
  if (size?.trim()) parts.push(size.trim())
  return parts.length ? parts.join(' / ') : ''
}
