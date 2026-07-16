'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { resolveShopMode } from '@/lib/categories'
import { buildShopPath } from '@/lib/shop-navigation'
import { productUrlPath } from '@/lib/product-slug'
import type { ShopMode } from '@/lib/categories'

function looksLikeDbId(id: string) {
  return /^c[a-z0-9]{20,}$/i.test(id)
}

type ProductLink = { id: string; slug?: string | null }

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
    (product: ProductLink | string) => {
      const link =
        typeof product === 'string' ? { id: product, slug: null } : product
      const { selectProduct, setView } = useStore.getState()
      selectProduct(link.id)
      setView('product', { syncUrl: false })
      router.push(productUrlPath(link))
    },
    [router]
  )

  /** Open product detail by DB id / slug, or resolve homepage items by name */
  const openProduct = useCallback(
    async (opts: { id?: string; slug?: string | null; name: string }) => {
      if (opts.id && looksLikeDbId(opts.id)) {
        goToProduct({ id: opts.id, slug: opts.slug })
        return
      }

      if (opts.slug) {
        try {
          const res = await fetch(`/api/products/${encodeURIComponent(opts.slug)}`)
          const data = await res.json()
          if (res.ok && data?.id) {
            goToProduct({ id: data.id, slug: data.slug || opts.slug })
            return
          }
        } catch {
          // fall through to name search
        }
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
        goToProduct({ id: match.id, slug: match.slug })
      } catch {
        toast.error('Could not open product')
      }
    },
    [goToProduct]
  )

  return { goToShop, goHome, goToProduct, openProduct }
}
