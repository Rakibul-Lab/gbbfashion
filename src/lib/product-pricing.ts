import {
  colorHasSizes,
  type ProductColorVariant,
  type ProductSizeStock,
  type VariantPricingMode,
} from '@/lib/product-colors'

export type ResolvedVariantPricing = {
  price: number
  originalPrice: number | null
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function normalizeBasePrice(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return roundMoney(value)
}

function normalizeCompareAt(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value) || value < 0) return null
  return roundMoney(value)
}

/** Resolved pricing for a color (ignores sizes). */
export function resolveColorPricing(
  variant: ProductColorVariant | null | undefined,
  basePrice: number,
  baseOriginalPrice: number | null | undefined
): ResolvedVariantPricing {
  const productPrice = normalizeBasePrice(basePrice)
  const productCompare = normalizeCompareAt(baseOriginalPrice)

  if (!variant || variant.pricingMode !== 'custom') {
    return { price: productPrice, originalPrice: productCompare }
  }

  const price =
    typeof variant.price === 'number' && Number.isFinite(variant.price)
      ? normalizeBasePrice(variant.price)
      : productPrice

  const originalPrice =
    variant.originalPrice === null
      ? null
      : typeof variant.originalPrice === 'number'
        ? normalizeCompareAt(variant.originalPrice)
        : productCompare

  return { price, originalPrice }
}

/** Resolved pricing for the active color + optional size selection. */
export function resolveVariantPricing(
  variant: ProductColorVariant | null | undefined,
  sizeLabel: string | null | undefined,
  basePrice: number,
  baseOriginalPrice: number | null | undefined
): ResolvedVariantPricing {
  const colorPricing = resolveColorPricing(variant, basePrice, baseOriginalPrice)

  if (!variant || !sizeLabel?.trim() || !colorHasSizes(variant)) {
    return colorPricing
  }

  const key = sizeLabel.trim().toLowerCase()
  const size = (variant.sizes || []).find(
    (s) => s.label.trim().toLowerCase() === key
  )
  if (!size) return colorPricing

  if (size.pricingMode !== 'custom') {
    return colorPricing
  }

  const price =
    typeof size.price === 'number' && Number.isFinite(size.price)
      ? normalizeBasePrice(size.price)
      : colorPricing.price

  const originalPrice =
    size.originalPrice === null
      ? null
      : typeof size.originalPrice === 'number'
        ? normalizeCompareAt(size.originalPrice)
        : colorPricing.originalPrice

  return { price, originalPrice }
}

/** @deprecated Use resolveVariantPricing — kept for callers that only need price. */
export function getSizePrice(
  variant: ProductColorVariant | null | undefined,
  sizeLabel: string | null | undefined,
  fallbackPrice: number
): number {
  return resolveVariantPricing(variant, sizeLabel, fallbackPrice, null).price
}

export function formatPricingSummary(
  pricing: ResolvedVariantPricing,
  format: (amount: number) => string
): string {
  if (pricing.originalPrice != null && pricing.originalPrice > pricing.price) {
    return `${format(pricing.price)} · Compare ${format(pricing.originalPrice)}`
  }
  return format(pricing.price)
}

export function isCustomPricing(mode: VariantPricingMode | undefined): boolean {
  return mode === 'custom'
}

export function defaultPricingPatch(
  mode: VariantPricingMode,
  basePrice?: number,
  baseOriginalPrice?: number | null
): Partial<ProductColorVariant & ProductSizeStock> {
  if (mode === 'base') {
    return {
      pricingMode: 'base',
      price: undefined,
      originalPrice: undefined,
    }
  }
  return {
    pricingMode: 'custom',
    price:
      typeof basePrice === 'number' && Number.isFinite(basePrice)
        ? basePrice
        : undefined,
    originalPrice: baseOriginalPrice ?? null,
  }
}
