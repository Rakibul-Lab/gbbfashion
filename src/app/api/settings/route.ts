import { NextRequest, NextResponse } from 'next/server'
import {
  getSiteSettings,
  saveSiteSettings,
  type HeroMediaType,
  type HomepageSectionConfig,
  type PromoBannerConfig,
  type SiteSettings,
  type SectionMediaMap,
} from '@/lib/site-settings'
import { mergeSectionMedia } from '@/lib/section-media'
import { normalizeInvoiceEmailSettings, type InvoiceEmailSettings } from '@/lib/invoice-email-settings'
import { normalizeMaintenanceSettings, type MaintenanceSettings } from '@/lib/maintenance-settings'
import { normalizeBagTheVibeContent } from '@/lib/site-settings-client'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const patch: Partial<SiteSettings> = {}

    if (typeof body.logoUrl === 'string') {
      patch.logoUrl = body.logoUrl.trim()
    }
    if (body.logoWidth !== undefined && body.logoWidth !== null && body.logoWidth !== '') {
      patch.logoWidth = Number(body.logoWidth)
    }
    if (body.logoHeight !== undefined && body.logoHeight !== null && body.logoHeight !== '') {
      patch.logoHeight = Number(body.logoHeight)
    }
    if (body.heroMediaType === 'image' || body.heroMediaType === 'video') {
      patch.heroMediaType = body.heroMediaType as HeroMediaType
    }
    if (typeof body.heroMediaUrl === 'string') {
      patch.heroMediaUrl = body.heroMediaUrl.trim()
    }
    if (typeof body.currencyCode === 'string' && body.currencyCode.trim()) {
      patch.currencyCode = body.currencyCode.trim().toUpperCase()
    }
    if (typeof body.whatsappNumber === 'string') {
      patch.whatsappNumber = body.whatsappNumber
    }
    if (body.whatsappIconId !== undefined && body.whatsappIconId !== null) {
      patch.whatsappIconId = body.whatsappIconId
    }
    if (typeof body.whatsappIconUrl === 'string') {
      patch.whatsappIconUrl = body.whatsappIconUrl
    }
    if (body.freeDeliveryMin !== undefined && body.freeDeliveryMin !== null && body.freeDeliveryMin !== '') {
      patch.freeDeliveryMin = Number(body.freeDeliveryMin)
    }
    if (body.deliveryCharge !== undefined && body.deliveryCharge !== null && body.deliveryCharge !== '') {
      patch.deliveryCharge = Number(body.deliveryCharge)
    }
    if (typeof body.facebookUrl === 'string') {
      patch.facebookUrl = body.facebookUrl
    }
    if (typeof body.instagramUrl === 'string') {
      patch.instagramUrl = body.instagramUrl
    }
    if (typeof body.tiktokUrl === 'string') {
      patch.tiktokUrl = body.tiktokUrl
    }
    if (Array.isArray(body.announcements)) {
      patch.announcements = body.announcements.map(String)
    }
    if (Array.isArray(body.promoBanners)) {
      patch.promoBanners = body.promoBanners as PromoBannerConfig[]
    }
    if (Array.isArray(body.homepageSections)) {
      patch.homepageSections = body.homepageSections as HomepageSectionConfig[]
    }
    if (body.sectionMedia && typeof body.sectionMedia === 'object') {
      patch.sectionMedia = mergeSectionMedia(body.sectionMedia as SectionMediaMap)
    }
    if (body.bagTheVibe && typeof body.bagTheVibe === 'object') {
      patch.bagTheVibe = normalizeBagTheVibeContent(body.bagTheVibe)
    }
    if (body.invoiceEmail && typeof body.invoiceEmail === 'object') {
      patch.invoiceEmail = normalizeInvoiceEmailSettings(
        body.invoiceEmail as InvoiceEmailSettings
      )
    }
    if (body.maintenance && typeof body.maintenance === 'object') {
      patch.maintenance = normalizeMaintenanceSettings(
        body.maintenance as MaintenanceSettings
      )
    }

    const settings = await saveSiteSettings(patch)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
