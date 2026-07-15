'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { resolveShopMode } from '@/lib/categories'
import { buildShopPath } from '@/lib/shop-navigation'
import type { ShopMode } from '@/lib/categories'

function looksLikeDbId(id: string) {
  return /^c[a-z0-9]{20,}$/i.test(id)
}

export function useShopNavigation() {
  const router = useRouter()
  const navigateToShop = useStore((s) => s.navigateToShop)

  const goToShop = useCallback(
    (options: {
      category?: string
      subCategory?: string | null
      shopMode?: ShopMode
      collection?: string | null
    } = {}) => {
      const category = options.category ?? 'all'
      const shopMode = options.shopMode ?? resolveShopMode(category)
      const path = buildShopPath(category, options.subCategory ?? null, shopMode)

      navigateToShop({ ...options, updateUrl: false })
      router.push(path)
    },
    [router, navigateToShop]
  )

  const goHome = useCallback(() => {
    useStore.getState().setView('home', { syncUrl: false })
    router.push('/')
  }, [router])

  const goToProduct = useCallback(
    (productId: string) => {
      const { selectProduct, setView } = useStore.getState()
      selectProduct(productId)
      setView('product', { syncUrl: false })
      router.push(`/products/${productId}`)
    },
    [router]
  )

  /** Open product detail by DB id, or resolve homepage/featured items by name */
  const openProduct = useCallback(
    async (opts: { id?: string; name: string }) => {
      if (opts.id && looksLikeDbId(opts.id)) {
        goToProduct(opts.id)
        return
      }

      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(opts.name)}`)
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) {
          toast.error('Product not found')
          return
        }

        const exact = data.find(
          (p: { name: string }) => p.name.toLowerCase() === opts.name.toLowerCase()
        )
        const match = exact || data[0]
        goToProduct(match.id)
      } catch {
        toast.error('Could not open product')
      }
    },
    [goToProduct]
  )

  return { goToShop, goHome, goToProduct, openProduct }
}
