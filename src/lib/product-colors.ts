/** Color + image variant used for gallery / homepage swatches */
export type ProductColorVariant = {
  name: string
  swatch: string
  image: string
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

export function swatchForColorName(name: string, fallback = '#888888'): string {
  const key = name.trim().toLowerCase()
  if (COLOR_NAME_SWATCHES[key]) return COLOR_NAME_SWATCHES[key]
  for (const [token, hex] of Object.entries(COLOR_NAME_SWATCHES)) {
    if (key.includes(token)) return hex
  }
  return fallback
}

export function parseGalleryImages(raw: string | null | undefined): ProductColorVariant[] {
  if (!raw?.trim()) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
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
          return {
            name: name || 'Color',
            swatch: swatch || '#888888',
            image,
          }
        })
        .filter((v): v is ProductColorVariant => Boolean(v))
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
    }
  })
}

export function serializeGalleryImages(variants: ProductColorVariant[]): string | null {
  const cleaned = variants
    .map((v) => ({
      name: v.name.trim() || 'Color',
      swatch: v.swatch.trim() || '#888888',
      image: v.image.trim(),
    }))
    .filter((v) => v.image || v.name)
  if (!cleaned.length) return null
  return JSON.stringify(cleaned)
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

export function cartLineKey(productId: string, color?: string | null): string {
  return `${productId}::${(color || '').trim().toLowerCase()}`
}
