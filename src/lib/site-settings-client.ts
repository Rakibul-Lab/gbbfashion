/** Client-safe defaults (no Node fs imports) */
/** Empty until admin uploads — never force a stock logo/hero. */
export const DEFAULT_LOGO_URL = ''
export const DEFAULT_LOGO_WIDTH = 36
export const DEFAULT_LOGO_HEIGHT = 36
export const MIN_LOGO_DIM = 16
export const MAX_LOGO_DIM = 200

export const DEFAULT_HERO_MEDIA_URL = ''
export const DEFAULT_HERO_MEDIA_TYPE = 'image' as const

export type HeroMediaType = 'image' | 'video'

export type PromoBannerConfig = {
  id: string
  title: string
  subtitle: string
  /** @deprecated use mediaUrl — kept for compatibility */
  image: string
  mediaType: HeroMediaType
  mediaUrl: string
  ctaLabel: string
  linkCategory: string
  enabled: boolean
}

export type HomepageSectionKey =
  | 'hero'
  | 'featuredCollections'
  | 'primeBags'
  | 'primeShoes'
  | 'promoBanners'
  | 'newInTrend'
  | 'newArrivals'
  | 'stories'
  | 'backpackSeries'
  | 'bagTheVibe'
  | 'luxeLeather'
  | 'toteBackpack'
  | 'ownItLeadIt'
  | 'trustBar'

export type HomepageSectionConfig = {
  key: HomepageSectionKey
  label: string
  enabled: boolean
}

export const DEFAULT_ANNOUNCEMENTS = [
  'FREE SHIPPING ON ORDERS OVER ৳2,000',
  'CASH ON DELIVERY AVAILABLE',
  'NEW ARRIVALS JUST DROPPED — SHOP NOW',
]

export const DEFAULT_PROMO_BANNERS: PromoBannerConfig[] = [
  {
    id: 'prime',
    title: 'The Prime Drop',
    subtitle: 'UPTO 50% OFF',
    image: '',
    mediaType: 'image',
    mediaUrl: '',
    ctaLabel: 'Shop Now',
    linkCategory: 'prime-drop',
    enabled: true,
  },
  {
    id: 'new',
    title: 'Luxe Leather Bags',
    subtitle: 'Exquisite craftsmanship meets contemporary design',
    image: '',
    mediaType: 'image',
    mediaUrl: '',
    ctaLabel: 'Explore Collection',
    linkCategory: 'women',
    enabled: true,
  },
]

export function normalizePromoBanners(
  saved?: PromoBannerConfig[] | null
): PromoBannerConfig[] {
  const source =
    Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_PROMO_BANNERS
  return source.map((b, i) => {
    const fallback = DEFAULT_PROMO_BANNERS[i] || DEFAULT_PROMO_BANNERS[0]
    const rawMedia =
      typeof b.mediaUrl === 'string'
        ? b.mediaUrl.trim()
        : typeof b.image === 'string'
          ? b.image.trim()
          : ''
    // Keep uploads/remote only — never force stock banner art
    const mediaUrl =
      !rawMedia ||
      rawMedia.startsWith('/uploads/') ||
      /^https?:\/\//i.test(rawMedia)
        ? rawMedia
        : ''
    return {
      id: b.id || fallback.id,
      title: b.title || fallback.title,
      subtitle: b.subtitle || fallback.subtitle,
      image: mediaUrl,
      mediaType: b.mediaType === 'video' ? 'video' : 'image',
      mediaUrl,
      ctaLabel: b.ctaLabel || fallback.ctaLabel,
      linkCategory: b.linkCategory || fallback.linkCategory,
      enabled: b.enabled !== false,
    }
  })
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { key: 'hero', label: 'Hero banner', enabled: true },
  { key: 'primeBags', label: 'Prime Bags', enabled: true },
  { key: 'primeShoes', label: 'Prime Shoes', enabled: true },
  { key: 'promoBanners', label: 'Promo Banners', enabled: true },
  { key: 'newInTrend', label: 'New In Trend', enabled: true },
  { key: 'newArrivals', label: 'New Arrivals', enabled: true },
  { key: 'stories', label: 'Stories / Reels', enabled: true },
  { key: 'backpackSeries', label: 'Backpack Series', enabled: true },
  { key: 'bagTheVibe', label: 'Bag The Vibe', enabled: true },
  { key: 'luxeLeather', label: 'Luxe Leather Bags', enabled: true },
  { key: 'toteBackpack', label: 'Tote / Backpack', enabled: true },
  { key: 'ownItLeadIt', label: 'Own It Lead It', enabled: true },
  { key: 'trustBar', label: 'Trust Bar', enabled: true },
]

/** Merge saved sections with defaults so new keys always appear in admin */
export function mergeHomepageSections(
  saved?: HomepageSectionConfig[] | null
): HomepageSectionConfig[] {
  const byKey = new Map((saved || []).map((s) => [s.key, s]))

  // Migrate legacy combined "Featured Collections" toggle → Prime Bags / Shoes
  const legacy = byKey.get('featuredCollections')
  if (legacy) {
    if (!byKey.has('primeBags')) {
      byKey.set('primeBags', {
        key: 'primeBags',
        label: 'Prime Bags',
        enabled: legacy.enabled !== false,
      })
    }
    if (!byKey.has('primeShoes')) {
      byKey.set('primeShoes', {
        key: 'primeShoes',
        label: 'Prime Shoes',
        enabled: legacy.enabled !== false,
      })
    }
  }

  return DEFAULT_HOMEPAGE_SECTIONS.map((def) => {
    const existing = byKey.get(def.key)
    return existing ? { ...def, enabled: existing.enabled, label: def.label } : def
  })
}

export type SiteBranding = {
  logoUrl: string
  logoWidth: number
  logoHeight: number
  heroMediaType: HeroMediaType
  heroMediaUrl: string
}

export type SiteContentSettings = {
  announcements: string[]
  promoBanners: PromoBannerConfig[]
  homepageSections: HomepageSectionConfig[]
}

export const DEFAULT_CURRENCY_CODE = 'BDT'

/** WhatsApp number with country code, digits only preferred (e.g. 8801335107218) */
export const DEFAULT_WHATSAPP_NUMBER = '8801335107218'

/** Free delivery when cart subtotal is at or above this amount */
export const DEFAULT_FREE_DELIVERY_MIN = 2000

/** Delivery fee when order is below free-delivery threshold */
export const DEFAULT_DELIVERY_CHARGE = 100

/** Footer social profile URLs */
export const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/GBBFashion'
export const DEFAULT_INSTAGRAM_URL = ''
export const DEFAULT_TIKTOK_URL = ''

export function normalizeSocialUrl(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('www.')) return `https://${trimmed}`
  return trimmed
}

export const WHATSAPP_ICON_PRESETS = [
  { id: 'classic', label: 'Classic' },
  { id: 'soft', label: 'Soft' },
  { id: 'dark', label: 'Dark' },
  { id: 'square', label: 'Rounded' },
  { id: 'outline', label: 'Outline' },
  { id: 'gradient', label: 'Gradient' },
] as const

export type WhatsAppPresetIconId = (typeof WHATSAPP_ICON_PRESETS)[number]['id']
export type WhatsAppIconId = WhatsAppPresetIconId | 'custom'

export const DEFAULT_WHATSAPP_ICON_ID: WhatsAppIconId = 'classic'
export const DEFAULT_WHATSAPP_ICON_URL = ''

export function normalizeWhatsAppIconId(value: unknown): WhatsAppIconId {
  if (value === 'custom') return 'custom'
  if (
    typeof value === 'string' &&
    WHATSAPP_ICON_PRESETS.some((p) => p.id === value)
  ) {
    return value as WhatsAppPresetIconId
  }
  return DEFAULT_WHATSAPP_ICON_ID
}

export function normalizeWhatsAppIconUrl(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_WHATSAPP_ICON_URL
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_WHATSAPP_ICON_URL
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return DEFAULT_WHATSAPP_ICON_URL
}

export function normalizeWhatsAppNumber(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_WHATSAPP_NUMBER
  const digits = value.replace(/\D/g, '')
  return digits || DEFAULT_WHATSAPP_NUMBER
}

export function normalizeMoneyAmount(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.round(n * 100) / 100
}

export function whatsappChatUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '')
  const base = `https://wa.me/${digits}`
  if (!message?.trim()) return base
  return `${base}?text=${encodeURIComponent(message.trim())}`
}

/** Suggested upload sizes shown in admin */
export const HERO_IMAGE_SUGGESTION = {
  width: 1920,
  height: 1080,
  label: '1920 × 1080 px (16:9)',
  maxMb: 5,
  formats: 'JPG, PNG, or WEBP',
}

export const HERO_VIDEO_SUGGESTION = {
  width: 1920,
  height: 1080,
  label: '1920 × 1080 px (16:9)',
  maxMb: null as number | null,
  formats: 'MP4 or WEBM',
  tip: 'No file size limit — video autoplays and loops on the homepage',
}

export const LOGO_SUGGESTION = {
  width: 512,
  height: 512,
  label: '512 × 512 px (square)',
  maxMb: 2,
  formats: 'PNG, JPG, WEBP, or SVG',
  tip: 'Square PNG with transparent background works best for the browser tab icon',
}

export function mimeFromUrl(url: string): string {
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.svg')) return 'image/svg+xml'
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg'
  if (clean.endsWith('.webp')) return 'image/webp'
  if (clean.endsWith('.gif')) return 'image/gif'
  if (clean.endsWith('.ico')) return 'image/x-icon'
  return 'image/png'
}
