import { promises as fs } from 'fs'
import path from 'path'
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_HERO_MEDIA_TYPE,
  DEFAULT_HERO_MEDIA_URL,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_LOGO_HEIGHT,
  DEFAULT_LOGO_URL,
  DEFAULT_LOGO_WIDTH,
  DEFAULT_PROMO_BANNERS,
  MAX_LOGO_DIM,
  MIN_LOGO_DIM,
  mergeHomepageSections,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_WHATSAPP_NUMBER,
  DEFAULT_FREE_DELIVERY_MIN,
  DEFAULT_DELIVERY_CHARGE,
  DEFAULT_WHATSAPP_ICON_ID,
  DEFAULT_WHATSAPP_ICON_URL,
  DEFAULT_FACEBOOK_URL,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_TIKTOK_URL,
  normalizeWhatsAppNumber,
  normalizeMoneyAmount,
  normalizeWhatsAppIconId,
  normalizeWhatsAppIconUrl,
  normalizeSocialUrl,
  normalizePromoBanners,
  normalizeBagTheVibeContent,
  DEFAULT_BAG_THE_VIBE,
  type HeroMediaType,
  type HomepageSectionConfig,
  type PromoBannerConfig,
  type WhatsAppIconId,
  type BagTheVibeContent,
} from '@/lib/site-settings-client'
import {
  DEFAULT_INVOICE_EMAIL,
  normalizeInvoiceEmailSettings,
  type InvoiceEmailSettings,
} from '@/lib/invoice-email-settings'
import {
  DEFAULT_MAINTENANCE,
  normalizeMaintenanceSettings,
  type MaintenanceSettings,
} from '@/lib/maintenance-settings'
import {
  mergeSectionMedia,
  type SectionMediaMap,
} from '@/lib/section-media'

export {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_HERO_MEDIA_TYPE,
  DEFAULT_HERO_MEDIA_URL,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_LOGO_HEIGHT,
  DEFAULT_LOGO_URL,
  DEFAULT_LOGO_WIDTH,
  DEFAULT_PROMO_BANNERS,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_WHATSAPP_NUMBER,
  DEFAULT_FREE_DELIVERY_MIN,
  DEFAULT_DELIVERY_CHARGE,
  DEFAULT_WHATSAPP_ICON_ID,
  DEFAULT_WHATSAPP_ICON_URL,
  DEFAULT_FACEBOOK_URL,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_TIKTOK_URL,
  WHATSAPP_ICON_PRESETS,
  normalizeWhatsAppNumber,
  normalizeMoneyAmount,
  normalizeWhatsAppIconId,
  normalizeWhatsAppIconUrl,
  normalizeSocialUrl,
  normalizePromoBanners,
  normalizeBagTheVibeContent,
  DEFAULT_BAG_THE_VIBE,
  whatsappChatUrl,
  MAX_LOGO_DIM,
  MIN_LOGO_DIM,
  mergeHomepageSections,
  type HeroMediaType,
  type HomepageSectionConfig,
  type PromoBannerConfig,
  type WhatsAppIconId,
  type BagTheVibeContent,
} from '@/lib/site-settings-client'

export {
  DEFAULT_INVOICE_EMAIL,
  INVOICE_EMAIL_TEMPLATES,
  normalizeInvoiceEmailSettings,
  normalizeInvoiceEmailTemplateId,
  type InvoiceEmailSettings,
  type InvoiceEmailTemplateId,
} from '@/lib/invoice-email-settings'

export {
  DEFAULT_MAINTENANCE,
  normalizeMaintenanceSettings,
  type MaintenanceSettings,
} from '@/lib/maintenance-settings'

export {
  mergeSectionMedia,
  defaultSectionMedia,
  type SectionMediaMap,
  type SectionMediaSlot,
  type SectionMediaType,
} from '@/lib/section-media'

export type SiteSettings = {
  logoUrl: string
  logoWidth: number
  logoHeight: number
  heroMediaType: HeroMediaType
  heroMediaUrl: string
  currencyCode: string
  whatsappNumber: string
  whatsappIconId: WhatsAppIconId
  whatsappIconUrl: string
  freeDeliveryMin: number
  deliveryCharge: number
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  announcements: string[]
  promoBanners: PromoBannerConfig[]
  homepageSections: HomepageSectionConfig[]
  sectionMedia: SectionMediaMap
  bagTheVibe: BagTheVibeContent
  invoiceEmail: InvoiceEmailSettings
  maintenance: MaintenanceSettings
  updatedAt?: string
}

const settingsPath = path.join(process.cwd(), 'data', 'site-settings.json')
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

export function clampLogoDim(size: unknown, fallback: number): number {
  const n = typeof size === 'number' ? size : Number(size)
  if (!Number.isFinite(n)) return fallback
  return Math.min(MAX_LOGO_DIM, Math.max(MIN_LOGO_DIM, Math.round(n)))
}

function normalizeHeroType(value: unknown): HeroMediaType {
  return value === 'video' ? 'video' : 'image'
}

export async function ensureSiteDirs() {
  await fs.mkdir(path.dirname(settingsPath), { recursive: true })
  await fs.mkdir(uploadsDir, { recursive: true })
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await fs.readFile(settingsPath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<SiteSettings> & { logoSize?: number }
    const legacy = typeof parsed.logoSize === 'number' ? parsed.logoSize : undefined
    const sanitizeBrandUrl = (value: unknown) => {
      const raw = typeof value === 'string' ? value.trim() : ''
      if (!raw) return ''
      const clean = raw.split('?')[0]
      if (clean.startsWith('/uploads/')) return raw
      if (/^https?:\/\//i.test(clean)) return raw
      // Legacy stock public assets (e.g. /logo.svg, /hero-banner.jpg)
      return ''
    }

    return {
      logoUrl: sanitizeBrandUrl(parsed.logoUrl),
      logoWidth: clampLogoDim(parsed.logoWidth ?? legacy ?? DEFAULT_LOGO_WIDTH, DEFAULT_LOGO_WIDTH),
      logoHeight: clampLogoDim(parsed.logoHeight ?? legacy ?? DEFAULT_LOGO_HEIGHT, DEFAULT_LOGO_HEIGHT),
      heroMediaType: normalizeHeroType(parsed.heroMediaType),
      heroMediaUrl: sanitizeBrandUrl(parsed.heroMediaUrl),
      currencyCode:
        typeof parsed.currencyCode === 'string' && parsed.currencyCode.trim()
          ? parsed.currencyCode.trim().toUpperCase()
          : DEFAULT_CURRENCY_CODE,
      whatsappNumber: normalizeWhatsAppNumber(parsed.whatsappNumber),
      whatsappIconId: normalizeWhatsAppIconId(parsed.whatsappIconId),
      whatsappIconUrl: normalizeWhatsAppIconUrl(parsed.whatsappIconUrl),
      freeDeliveryMin: normalizeMoneyAmount(
        parsed.freeDeliveryMin,
        DEFAULT_FREE_DELIVERY_MIN
      ),
      deliveryCharge: normalizeMoneyAmount(
        parsed.deliveryCharge,
        DEFAULT_DELIVERY_CHARGE
      ),
      facebookUrl:
        parsed.facebookUrl !== undefined
          ? normalizeSocialUrl(parsed.facebookUrl, '')
          : DEFAULT_FACEBOOK_URL,
      instagramUrl: normalizeSocialUrl(parsed.instagramUrl, DEFAULT_INSTAGRAM_URL),
      tiktokUrl: normalizeSocialUrl(parsed.tiktokUrl, DEFAULT_TIKTOK_URL),
      announcements:
        Array.isArray(parsed.announcements) && parsed.announcements.length > 0
          ? parsed.announcements.map(String)
          : DEFAULT_ANNOUNCEMENTS,
      promoBanners: normalizePromoBanners(
        Array.isArray(parsed.promoBanners)
          ? (parsed.promoBanners as PromoBannerConfig[])
          : null
      ),
      homepageSections: mergeHomepageSections(
        Array.isArray(parsed.homepageSections)
          ? (parsed.homepageSections as HomepageSectionConfig[])
          : null
      ),
      sectionMedia: mergeSectionMedia(
        parsed.sectionMedia && typeof parsed.sectionMedia === 'object'
          ? (parsed.sectionMedia as SectionMediaMap)
          : null
      ),
      bagTheVibe: normalizeBagTheVibeContent(parsed.bagTheVibe),
      invoiceEmail: normalizeInvoiceEmailSettings(parsed.invoiceEmail),
      maintenance: normalizeMaintenanceSettings(parsed.maintenance),
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return {
      logoUrl: '',
      logoWidth: DEFAULT_LOGO_WIDTH,
      logoHeight: DEFAULT_LOGO_HEIGHT,
      heroMediaType: DEFAULT_HERO_MEDIA_TYPE,
      heroMediaUrl: '',
      currencyCode: DEFAULT_CURRENCY_CODE,
      whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
      whatsappIconId: DEFAULT_WHATSAPP_ICON_ID,
      whatsappIconUrl: DEFAULT_WHATSAPP_ICON_URL,
      freeDeliveryMin: DEFAULT_FREE_DELIVERY_MIN,
      deliveryCharge: DEFAULT_DELIVERY_CHARGE,
      facebookUrl: DEFAULT_FACEBOOK_URL,
      instagramUrl: DEFAULT_INSTAGRAM_URL,
      tiktokUrl: DEFAULT_TIKTOK_URL,
      announcements: DEFAULT_ANNOUNCEMENTS,
      promoBanners: normalizePromoBanners(null),
      homepageSections: mergeHomepageSections(null),
      sectionMedia: mergeSectionMedia(null),
      bagTheVibe: DEFAULT_BAG_THE_VIBE,
      invoiceEmail: DEFAULT_INVOICE_EMAIL,
      maintenance: DEFAULT_MAINTENANCE,
    }
  }
}

export async function saveSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  await ensureSiteDirs()
  const current = await getSiteSettings()
  const next: SiteSettings = {
    logoUrl: patch.logoUrl ?? current.logoUrl,
    logoWidth:
      patch.logoWidth !== undefined
        ? clampLogoDim(patch.logoWidth, current.logoWidth)
        : current.logoWidth,
    logoHeight:
      patch.logoHeight !== undefined
        ? clampLogoDim(patch.logoHeight, current.logoHeight)
        : current.logoHeight,
    heroMediaType:
      patch.heroMediaType !== undefined
        ? normalizeHeroType(patch.heroMediaType)
        : current.heroMediaType,
    heroMediaUrl: patch.heroMediaUrl ?? current.heroMediaUrl,
    currencyCode:
      typeof patch.currencyCode === 'string' && patch.currencyCode.trim()
        ? patch.currencyCode.trim().toUpperCase()
        : current.currencyCode,
    whatsappNumber:
      patch.whatsappNumber !== undefined
        ? normalizeWhatsAppNumber(patch.whatsappNumber)
        : current.whatsappNumber,
    whatsappIconId:
      patch.whatsappIconId !== undefined
        ? normalizeWhatsAppIconId(patch.whatsappIconId)
        : current.whatsappIconId,
    whatsappIconUrl:
      patch.whatsappIconUrl !== undefined
        ? normalizeWhatsAppIconUrl(patch.whatsappIconUrl)
        : current.whatsappIconUrl,
    freeDeliveryMin:
      patch.freeDeliveryMin !== undefined
        ? normalizeMoneyAmount(patch.freeDeliveryMin, current.freeDeliveryMin)
        : current.freeDeliveryMin,
    deliveryCharge:
      patch.deliveryCharge !== undefined
        ? normalizeMoneyAmount(patch.deliveryCharge, current.deliveryCharge)
        : current.deliveryCharge,
    facebookUrl:
      patch.facebookUrl !== undefined
        ? normalizeSocialUrl(patch.facebookUrl, current.facebookUrl)
        : current.facebookUrl,
    instagramUrl:
      patch.instagramUrl !== undefined
        ? normalizeSocialUrl(patch.instagramUrl, current.instagramUrl)
        : current.instagramUrl,
    tiktokUrl:
      patch.tiktokUrl !== undefined
        ? normalizeSocialUrl(patch.tiktokUrl, current.tiktokUrl)
        : current.tiktokUrl,
    announcements: patch.announcements ?? current.announcements,
    promoBanners: normalizePromoBanners(patch.promoBanners ?? current.promoBanners),
    homepageSections: mergeHomepageSections(
      patch.homepageSections ?? current.homepageSections
    ),
    sectionMedia: mergeSectionMedia(patch.sectionMedia ?? current.sectionMedia),
    bagTheVibe: normalizeBagTheVibeContent(
      patch.bagTheVibe ?? current.bagTheVibe
    ),
    invoiceEmail: normalizeInvoiceEmailSettings(
      patch.invoiceEmail ?? current.invoiceEmail
    ),
    maintenance: normalizeMaintenanceSettings(
      patch.maintenance ?? current.maintenance
    ),
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(settingsPath, JSON.stringify(next, null, 2), 'utf8')
  return next
}

export function getUploadsDir() {
  return uploadsDir
}
