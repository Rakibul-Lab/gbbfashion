'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_HERO_MEDIA_TYPE,
  DEFAULT_HERO_MEDIA_URL,
  DEFAULT_LOGO_HEIGHT,
  DEFAULT_LOGO_URL,
  DEFAULT_LOGO_WIDTH,
  mimeFromUrl,
  type SiteBranding,
} from '@/lib/site-settings-client'

const FAVICON_ATTR = 'data-gbb-favicon'

/**
 * Updates favicon without removing Next.js-managed <link> nodes.
 * Deleting those causes: Cannot read properties of null (reading 'removeChild').
 */
function applyFavicon(logoUrl: string) {
  if (typeof document === 'undefined' || !logoUrl) return

  const type = mimeFromUrl(logoUrl)
  const href = `/api/favicon?v=${encodeURIComponent(logoUrl)}`

  const existing = document.querySelectorAll(`link[${FAVICON_ATTR}]`)
  if (existing.length > 0) {
    existing.forEach((node) => {
      const link = node as HTMLLinkElement
      link.href = href
      link.type = type
    })
    return
  }

  const add = (rel: string, sizes?: string) => {
    const link = document.createElement('link')
    link.setAttribute(FAVICON_ATTR, '1')
    link.rel = rel
    link.type = type
    link.href = href
    if (sizes) link.setAttribute('sizes', sizes)
    document.head.appendChild(link)
  }

  add('icon', 'any')
  add('apple-touch-icon', '180x180')
}

export function useSiteLogo() {
  const [branding, setBranding] = useState<SiteBranding>({
    logoUrl: DEFAULT_LOGO_URL,
    logoWidth: DEFAULT_LOGO_WIDTH,
    logoHeight: DEFAULT_LOGO_HEIGHT,
    heroMediaType: DEFAULT_HERO_MEDIA_TYPE,
    heroMediaUrl: DEFAULT_HERO_MEDIA_URL,
  })

  // Prefer saved logo immediately (avoids flash of default while /api/settings loads)
  useEffect(() => {
    applyFavicon(branding.logoUrl)
  }, [branding.logoUrl])

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data) return
        const next: SiteBranding = {
          logoUrl: data.logoUrl || DEFAULT_LOGO_URL,
          logoWidth:
            typeof data.logoWidth === 'number'
              ? data.logoWidth
              : typeof data.logoSize === 'number'
                ? data.logoSize
                : DEFAULT_LOGO_WIDTH,
          logoHeight:
            typeof data.logoHeight === 'number'
              ? data.logoHeight
              : typeof data.logoSize === 'number'
                ? data.logoSize
                : DEFAULT_LOGO_HEIGHT,
          heroMediaType: data.heroMediaType === 'video' ? 'video' : 'image',
          heroMediaUrl: data.heroMediaUrl || DEFAULT_HERO_MEDIA_URL,
        }
        setBranding(next)
        queueMicrotask(() => {
          if (!cancelled) applyFavicon(next.logoUrl)
        })
      })
      .catch(() => undefined)

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Partial<SiteBranding>>).detail
      if (!detail) return
      setBranding((prev) => {
        const next: SiteBranding = {
          logoUrl: detail.logoUrl !== undefined ? detail.logoUrl : prev.logoUrl,
          logoWidth: detail.logoWidth ?? prev.logoWidth,
          logoHeight: detail.logoHeight ?? prev.logoHeight,
          heroMediaType: detail.heroMediaType ?? prev.heroMediaType,
          heroMediaUrl:
            detail.heroMediaUrl !== undefined ? detail.heroMediaUrl : prev.heroMediaUrl,
        }
        if (detail.logoUrl !== undefined) {
          queueMicrotask(() => applyFavicon(detail.logoUrl || ''))
        }
        return next
      })
    }

    window.addEventListener('site-logo-updated', onUpdated as EventListener)
    window.addEventListener('site-settings-updated', onUpdated as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener('site-logo-updated', onUpdated as EventListener)
      window.removeEventListener('site-settings-updated', onUpdated as EventListener)
    }
  }, [])

  return branding
}
