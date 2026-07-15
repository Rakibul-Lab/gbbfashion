'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_CURRENCY_CODE,
  formatMoney as formatMoneyUtil,
  getCurrency,
  type CurrencyOption,
} from '@/lib/currency'

export const CURRENCY_UPDATED_EVENT = 'site-currency-updated'

export function broadcastCurrency(code: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(CURRENCY_UPDATED_EVENT, { detail: { currencyCode: code } })
  )
  window.dispatchEvent(
    new CustomEvent('site-settings-updated', { detail: { currencyCode: code } })
  )
}

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyOption>(() =>
    getCurrency(DEFAULT_CURRENCY_CODE)
  )

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data) return
        setCurrency(getCurrency(data.currencyCode || DEFAULT_CURRENCY_CODE))
      })
      .catch(() => undefined)

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ currencyCode?: string }>).detail
      if (detail?.currencyCode) {
        setCurrency(getCurrency(detail.currencyCode))
      }
    }

    window.addEventListener(CURRENCY_UPDATED_EVENT, onUpdated as EventListener)
    window.addEventListener('site-settings-updated', onUpdated as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener(CURRENCY_UPDATED_EVENT, onUpdated as EventListener)
      window.removeEventListener('site-settings-updated', onUpdated as EventListener)
    }
  }, [])

  const format = useCallback(
    (amount: number) => formatMoneyUtil(amount, currency),
    [currency]
  )

  return {
    currency,
    code: currency.code,
    symbol: currency.symbol,
    name: currency.name,
    format,
  }
}
