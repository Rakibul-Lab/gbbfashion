'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_DELIVERY_CHARGE,
  DEFAULT_FACEBOOK_URL,
  DEFAULT_FREE_DELIVERY_MIN,
  DEFAULT_INSTAGRAM_URL,
  DEFAULT_TIKTOK_URL,
  DEFAULT_WHATSAPP_ICON_ID,
  DEFAULT_WHATSAPP_ICON_URL,
  DEFAULT_WHATSAPP_NUMBER,
  normalizeMoneyAmount,
  normalizeSocialUrl,
  normalizeWhatsAppIconId,
  normalizeWhatsAppIconUrl,
  normalizeWhatsAppNumber,
  type WhatsAppIconId,
} from '@/lib/site-settings-client'

export const STORE_SETTINGS_UPDATED_EVENT = 'site-store-settings-updated'

export type StoreCommerceSettings = {
  whatsappNumber: string
  whatsappIconId: WhatsAppIconId
  whatsappIconUrl: string
  freeDeliveryMin: number
  deliveryCharge: number
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
}

export function broadcastStoreSettings(detail: Partial<StoreCommerceSettings>) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(STORE_SETTINGS_UPDATED_EVENT, { detail }))
  window.dispatchEvent(new CustomEvent('site-settings-updated', { detail }))
}

const defaults: StoreCommerceSettings = {
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  whatsappIconId: DEFAULT_WHATSAPP_ICON_ID,
  whatsappIconUrl: DEFAULT_WHATSAPP_ICON_URL,
  freeDeliveryMin: DEFAULT_FREE_DELIVERY_MIN,
  deliveryCharge: DEFAULT_DELIVERY_CHARGE,
  facebookUrl: DEFAULT_FACEBOOK_URL,
  instagramUrl: DEFAULT_INSTAGRAM_URL,
  tiktokUrl: DEFAULT_TIKTOK_URL,
}

export function useStoreCommerce() {
  const [settings, setSettings] = useState<StoreCommerceSettings>(defaults)

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data) return
        setSettings({
          whatsappNumber: normalizeWhatsAppNumber(data.whatsappNumber),
          whatsappIconId: normalizeWhatsAppIconId(data.whatsappIconId),
          whatsappIconUrl: normalizeWhatsAppIconUrl(data.whatsappIconUrl),
          freeDeliveryMin: normalizeMoneyAmount(
            data.freeDeliveryMin,
            DEFAULT_FREE_DELIVERY_MIN
          ),
          deliveryCharge: normalizeMoneyAmount(
            data.deliveryCharge,
            DEFAULT_DELIVERY_CHARGE
          ),
          facebookUrl: normalizeSocialUrl(
            data.facebookUrl !== undefined ? data.facebookUrl : DEFAULT_FACEBOOK_URL,
            DEFAULT_FACEBOOK_URL
          ),
          instagramUrl: normalizeSocialUrl(data.instagramUrl, DEFAULT_INSTAGRAM_URL),
          tiktokUrl: normalizeSocialUrl(data.tiktokUrl, DEFAULT_TIKTOK_URL),
        })
      })
      .catch(() => undefined)

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Partial<StoreCommerceSettings>>).detail
      if (!detail) return
      setSettings((prev) => ({
        whatsappNumber:
          detail.whatsappNumber !== undefined
            ? normalizeWhatsAppNumber(detail.whatsappNumber)
            : prev.whatsappNumber,
        whatsappIconId:
          detail.whatsappIconId !== undefined
            ? normalizeWhatsAppIconId(detail.whatsappIconId)
            : prev.whatsappIconId,
        whatsappIconUrl:
          detail.whatsappIconUrl !== undefined
            ? normalizeWhatsAppIconUrl(detail.whatsappIconUrl)
            : prev.whatsappIconUrl,
        freeDeliveryMin:
          detail.freeDeliveryMin !== undefined
            ? normalizeMoneyAmount(detail.freeDeliveryMin, prev.freeDeliveryMin)
            : prev.freeDeliveryMin,
        deliveryCharge:
          detail.deliveryCharge !== undefined
            ? normalizeMoneyAmount(detail.deliveryCharge, prev.deliveryCharge)
            : prev.deliveryCharge,
        facebookUrl:
          detail.facebookUrl !== undefined
            ? normalizeSocialUrl(detail.facebookUrl, '')
            : prev.facebookUrl,
        instagramUrl:
          detail.instagramUrl !== undefined
            ? normalizeSocialUrl(detail.instagramUrl, '')
            : prev.instagramUrl,
        tiktokUrl:
          detail.tiktokUrl !== undefined
            ? normalizeSocialUrl(detail.tiktokUrl, '')
            : prev.tiktokUrl,
      }))
    }

    window.addEventListener(STORE_SETTINGS_UPDATED_EVENT, onUpdated as EventListener)
    window.addEventListener('site-settings-updated', onUpdated as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener(STORE_SETTINGS_UPDATED_EVENT, onUpdated as EventListener)
      window.removeEventListener('site-settings-updated', onUpdated as EventListener)
    }
  }, [])

  const getShipping = useCallback(
    (subtotal: number) => {
      if (subtotal >= settings.freeDeliveryMin) return 0
      return settings.deliveryCharge
    },
    [settings.deliveryCharge, settings.freeDeliveryMin]
  )

  return {
    ...settings,
    getShipping,
  }
}
