/** Shared homepage / shop section media slots (image | video) */

export type SectionMediaType = 'image' | 'video'

export type SectionMediaSlot = {
  type: SectionMediaType
  url: string
}

export type SectionMediaSlotDef = {
  key: string
  label: string
  group: string
  description: string
  defaultUrl: string
  defaultType?: SectionMediaType
  /** Prefer landscape / portrait guidance for admin */
  aspectHint: string
}

export const SECTION_MEDIA_SLOTS: SectionMediaSlotDef[] = [
  {
    key: 'promo_prime',
    label: 'Prime Drop banner',
    group: 'Promo Banners',
    description: 'Full-width first promo banner on the homepage',
    defaultUrl: '/banner-prime-drop.png',
    aspectHint: '1920 × 900 (wide)',
  },
  {
    key: 'promo_second',
    label: 'Second promo banner',
    group: 'Promo Banners',
    description: 'Full-width second promo banner on the homepage',
    defaultUrl: '/banner-luxe-leather.png',
    aspectHint: '1920 × 900 (wide)',
  },
  {
    key: 'backpack_series_0',
    label: 'Backpack Series (large tile)',
    group: 'Backpack Series',
    description: 'Large left collection tile',
    defaultUrl: '/backpack-series.jpg',
    aspectHint: '1200 × 1600 (portrait)',
  },
  {
    key: 'backpack_series_1',
    label: 'Shoulder Bags tile',
    group: 'Backpack Series',
    description: 'Top-right collection tile',
    defaultUrl: '/shoulder-bags-collection.jpg',
    aspectHint: '1200 × 900',
  },
  {
    key: 'backpack_series_2',
    label: 'Handbags tile',
    group: 'Backpack Series',
    description: 'Bottom-right collection tile',
    defaultUrl: '/handbags-collection.jpg',
    aspectHint: '1200 × 900',
  },
  {
    key: 'bag_the_vibe',
    label: 'Bag The Vibe lifestyle',
    group: 'Bag The Vibe',
    description: 'Left lifestyle media in Bag The Vibe',
    defaultUrl: '/bag-the-vibe.jpg',
    aspectHint: '900 × 1200 (portrait)',
  },
  {
    key: 'bag_the_vibe_product',
    label: 'Bag The Vibe product',
    group: 'Bag The Vibe',
    description: 'Product media on the right side',
    defaultUrl: '/products/featured/butterfly-bag.png',
    aspectHint: '800 × 800 (square)',
  },
  {
    key: 'luxe_leather',
    label: 'Luxe Leather media',
    group: 'Luxe Leather',
    description: 'Right-side lifestyle media',
    defaultUrl: '/luxe-leather-bags.jpg',
    aspectHint: '1200 × 1600 (portrait)',
  },
  {
    key: 'own_it_lead_it',
    label: 'Own It Lead It media',
    group: 'Own It Lead It',
    description: 'Left lifestyle media',
    defaultUrl: '/own-it-lead-it.jpg',
    aspectHint: '1400 × 1050',
  },
  {
    key: 'shop_new_arrivals_left',
    label: 'New Arrivals — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on New Arrivals shop page',
    defaultUrl: '/products/women-shoulder-bag.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_new_arrivals_right',
    label: 'New Arrivals — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on New Arrivals shop page',
    defaultUrl: '/products/men-shoes.png',
    aspectHint: '800 × 1000',
  },
  {
    key: 'shop_prime_drop_left',
    label: 'Prime Drop — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on Prime Drop shop page',
    defaultUrl: '/products/men-shoes.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_prime_drop_right',
    label: 'Prime Drop — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on Prime Drop shop page',
    defaultUrl: '/products/women-hand-bag.png',
    aspectHint: '800 × 1000',
  },
  {
    key: 'shop_women_left',
    label: 'Women — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on Women shop page',
    defaultUrl: '/products/women-crossbody-bag.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_women_right',
    label: 'Women — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on Women shop page',
    defaultUrl: '/products/women-hand-bag-2.png',
    aspectHint: '800 × 1000',
  },
  {
    key: 'shop_men_left',
    label: 'Men — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on Men shop page',
    defaultUrl: '/products/men-backpack.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_men_right',
    label: 'Men — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on Men shop page',
    defaultUrl: '/products/men-long-wallet.png',
    aspectHint: '800 × 1000',
  },
  {
    key: 'shop_shoes_left',
    label: 'Shoes — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on Shoes shop page',
    defaultUrl: '/products/men-shoes.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_shoes_right',
    label: 'Shoes — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on Shoes shop page',
    defaultUrl: '/products/women-shoes.png',
    aspectHint: '800 × 1000',
  },
  {
    key: 'shop_belt_left',
    label: 'Belt — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on Belt shop page',
    defaultUrl: '/products/men-long-wallet.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_belt_right',
    label: 'Belt — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on Belt shop page',
    defaultUrl: '/products/women-hand-bag.png',
    aspectHint: '800 × 1000',
  },
  {
    key: 'shop_kids_left',
    label: 'Kids — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on Kids shop page',
    defaultUrl: '/products/women-mini-bag.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_kids_right',
    label: 'Kids — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on Kids shop page',
    defaultUrl: '/products/men-backpack.png',
    aspectHint: '800 × 1000',
  },
  {
    key: 'shop_accessories_left',
    label: 'Accessories — left',
    group: 'Shop Heroes',
    description: 'Left hero visual on Accessories shop page',
    defaultUrl: '/products/men-long-wallet.png',
    aspectHint: '800 × 800',
  },
  {
    key: 'shop_accessories_right',
    label: 'Accessories — right',
    group: 'Shop Heroes',
    description: 'Right hero visual on Accessories shop page',
    defaultUrl: '/products/women-mini-bag.png',
    aspectHint: '800 × 1000',
  },
]

export type SectionMediaMap = Record<string, SectionMediaSlot>

/** Empty map for all slots — never prefill stock images. */
export function defaultSectionMedia(): SectionMediaMap {
  const map: SectionMediaMap = {}
  for (const slot of SECTION_MEDIA_SLOTS) {
    map[slot.key] = {
      type: slot.defaultType || 'image',
      url: '',
    }
  }
  return map
}

/** True when URL is a built-in public stock asset (not an admin upload). */
export function isStockSectionMediaUrl(_key: string, url: string): boolean {
  const clean = url.split('?')[0]
  if (!clean || clean.startsWith('/uploads/')) return false
  if (/^https?:\/\//i.test(clean)) return false
  // Any leftover public path (e.g. /banner-*.png) is treated as blank stock art
  return true
}

/** Keep uploads/remote URLs; clear legacy public stock paths. */
export function keepUploadedMediaUrl(url: string): string {
  const trimmed = typeof url === 'string' ? url.trim() : ''
  if (!trimmed) return ''
  if (isStockSectionMediaUrl('', trimmed)) return ''
  return trimmed
}

/**
 * Merge saved section media.
 * Empty string is preserved (blank on storefront).
 * Missing keys start blank. Stock public defaults are treated as blank.
 */
export function mergeSectionMedia(saved?: SectionMediaMap | null): SectionMediaMap {
  const next = defaultSectionMedia()
  if (!saved || typeof saved !== 'object') return next

  for (const slot of SECTION_MEDIA_SLOTS) {
    const row = saved[slot.key]
    if (!row || typeof row !== 'object') continue
    const type: SectionMediaType = row.type === 'video' ? 'video' : 'image'
    let url = typeof row.url === 'string' ? row.url.trim() : ''
    if (url && isStockSectionMediaUrl(slot.key, url)) {
      url = ''
    }
    next[slot.key] = { type, url }
  }
  return next
}

export function getSectionMedia(
  map: SectionMediaMap | null | undefined,
  key: string
): SectionMediaSlot {
  const merged = mergeSectionMedia(map)
  return merged[key] || { type: 'image', url: '' }
}

/** Homepage lifestyle / banner slots that show on the storefront front page */
export const HOMEPAGE_FRONT_MEDIA_KEYS = [
  'promo_prime',
  'promo_second',
  'backpack_series_0',
  'backpack_series_1',
  'backpack_series_2',
  'bag_the_vibe',
  'bag_the_vibe_product',
  'luxe_leather',
  'own_it_lead_it',
] as const

/** All section slots that can receive featured product image fallbacks */
export const FRONT_IMAGE_FALLBACK_KEYS: readonly string[] = SECTION_MEDIA_SLOTS.map((s) => s.key)

/**
 * Fill empty front image slots with product images (featured first).
 * Existing uploaded URLs are never overwritten.
 */
export function fillEmptySectionMediaWithImages(
  map: SectionMediaMap,
  imageUrls: string[],
  keys: readonly string[] = FRONT_IMAGE_FALLBACK_KEYS
): SectionMediaMap {
  const urls = imageUrls.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean)
  if (!urls.length) return map

  const next: SectionMediaMap = { ...map }
  let cursor = 0
  for (const key of keys) {
    const current = next[key]
    if (current?.url) continue
    next[key] = {
      type: 'image',
      url: urls[cursor % urls.length],
    }
    cursor += 1
  }
  return next
}

/** Prefer featured product images, then prime / new arrivals, then any with an image */
export function collectFrontProductImages(
  products: Array<{
    image?: string | null
    isFeatured?: boolean | null
    isPrimeDrop?: boolean | null
    isNewArrival?: boolean | null
  }>
): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  const push = (url?: string | null) => {
    const clean = typeof url === 'string' ? url.trim() : ''
    if (!clean || seen.has(clean)) return
    seen.add(clean)
    out.push(clean)
  }

  for (const p of products) {
    if (p.isFeatured) push(p.image)
  }
  for (const p of products) {
    if (p.isPrimeDrop || p.isNewArrival) push(p.image)
  }
  for (const p of products) {
    push(p.image)
  }

  return out
}

export function sectionMediaGroups(): { group: string; slots: SectionMediaSlotDef[] }[] {
  const order: string[] = []
  const byGroup = new Map<string, SectionMediaSlotDef[]>()
  for (const slot of SECTION_MEDIA_SLOTS) {
    if (!byGroup.has(slot.group)) {
      byGroup.set(slot.group, [])
      order.push(slot.group)
    }
    byGroup.get(slot.group)!.push(slot)
  }
  return order.map((group) => ({ group, slots: byGroup.get(group)! }))
}

/** Map shop page modes/categories to media slot keys */
export const SHOP_HERO_MEDIA_KEYS: Record<
  string,
  { left: string; right: string }
> = {
  'new-arrivals': {
    left: 'shop_new_arrivals_left',
    right: 'shop_new_arrivals_right',
  },
  'prime-drop': {
    left: 'shop_prime_drop_left',
    right: 'shop_prime_drop_right',
  },
  women: { left: 'shop_women_left', right: 'shop_women_right' },
  men: { left: 'shop_men_left', right: 'shop_men_right' },
  shoes: { left: 'shop_shoes_left', right: 'shop_shoes_right' },
  belt: { left: 'shop_belt_left', right: 'shop_belt_right' },
  kids: { left: 'shop_kids_left', right: 'shop_kids_right' },
  accessories: {
    left: 'shop_accessories_left',
    right: 'shop_accessories_right',
  },
}
