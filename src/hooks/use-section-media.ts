'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  collectFrontProductImages,
  defaultSectionMedia,
  fillEmptySectionMediaWithImages,
  mergeSectionMedia,
  type SectionMediaMap,
  type SectionMediaSlot,
} from '@/lib/section-media'

export const SECTION_MEDIA_UPDATED_EVENT = 'site-section-media-updated'

export function broadcastSectionMedia(detail: SectionMediaMap) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SECTION_MEDIA_UPDATED_EVENT, { detail }))
  window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: { sectionMedia: detail } }))
}

async function fetchFrontProductImages(): Promise<string[]> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' })
    if (!res.ok) return []
    const products = await res.json()
    if (!Array.isArray(products)) return []
    return collectFrontProductImages(products)
  } catch {
    return []
  }
}

function withFeaturedFallback(saved: SectionMediaMap | null | undefined, images: string[]) {
  return fillEmptySectionMediaWithImages(mergeSectionMedia(saved), images)
}

export function useSectionMedia() {
  const [media, setMedia] = useState<SectionMediaMap>(() => defaultSectionMedia())
  const [loaded, setLoaded] = useState(false)
  const featuredImagesRef = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch('/api/settings', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => (data?.sectionMedia as SectionMediaMap | undefined) ?? null)
        .catch(() => null),
      fetchFrontProductImages(),
    ]).then(([saved, images]) => {
      if (cancelled) return
      featuredImagesRef.current = images
      setMedia(withFeaturedFallback(saved, images))
      setLoaded(true)
    })

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | SectionMediaMap
        | { sectionMedia?: SectionMediaMap }
        | null
        | undefined
      if (!detail || typeof detail !== 'object') return

      const nested =
        'sectionMedia' in detail &&
        detail.sectionMedia &&
        typeof detail.sectionMedia === 'object' &&
        !('url' in detail.sectionMedia)
          ? detail.sectionMedia
          : null

      if (nested) {
        setMedia(withFeaturedFallback(nested, featuredImagesRef.current))
        return
      }

      if (!('url' in detail && 'type' in detail)) {
        setMedia(withFeaturedFallback(detail as SectionMediaMap, featuredImagesRef.current))
      }
    }

    window.addEventListener(SECTION_MEDIA_UPDATED_EVENT, onUpdated as EventListener)
    window.addEventListener('site-settings-updated', onUpdated as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener(SECTION_MEDIA_UPDATED_EVENT, onUpdated as EventListener)
      window.removeEventListener('site-settings-updated', onUpdated as EventListener)
    }
  }, [])

  const get = useCallback(
    (key: string): SectionMediaSlot => {
      return media[key] || { type: 'image', url: '' }
    },
    [media]
  )

  return { media, get, loaded }
}
