'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  defaultSectionMedia,
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

export function useSectionMedia() {
  const [media, setMedia] = useState<SectionMediaMap>(() => defaultSectionMedia())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setMedia(mergeSectionMedia(data?.sectionMedia))
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
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
        setMedia(mergeSectionMedia(nested))
        return
      }

      if (!('url' in detail && 'type' in detail)) {
        setMedia(mergeSectionMedia(detail as SectionMediaMap))
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
