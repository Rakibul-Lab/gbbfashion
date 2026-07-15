'use client'

import { useSiteLogo } from '@/hooks/use-site-logo'

/** Keeps browser tab favicon in sync with uploaded site logo */
export function SiteFavicon() {
  useSiteLogo()
  return null
}
