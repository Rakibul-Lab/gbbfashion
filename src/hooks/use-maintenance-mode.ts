'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_MAINTENANCE,
  normalizeMaintenanceSettings,
  type MaintenanceSettings,
} from '@/lib/maintenance-settings'

export const MAINTENANCE_UPDATED_EVENT = 'site-maintenance-updated'

export function broadcastMaintenance(settings: MaintenanceSettings) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(MAINTENANCE_UPDATED_EVENT, { detail: settings }))
  window.dispatchEvent(
    new CustomEvent('site-settings-updated', { detail: { maintenance: settings } })
  )
}

export function useMaintenanceMode() {
  const [settings, setSettings] = useState<MaintenanceSettings>(DEFAULT_MAINTENANCE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setSettings(normalizeMaintenanceSettings(data?.maintenance))
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (!detail) return
      if (detail.maintenance) {
        setSettings(normalizeMaintenanceSettings(detail.maintenance))
        return
      }
      if (typeof detail.enabled === 'boolean') {
        setSettings(normalizeMaintenanceSettings(detail))
      }
    }

    window.addEventListener(MAINTENANCE_UPDATED_EVENT, onUpdated as EventListener)
    window.addEventListener('site-settings-updated', onUpdated as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener(MAINTENANCE_UPDATED_EVENT, onUpdated as EventListener)
      window.removeEventListener('site-settings-updated', onUpdated as EventListener)
    }
  }, [])

  return { settings, loaded, enabled: settings.enabled }
}
