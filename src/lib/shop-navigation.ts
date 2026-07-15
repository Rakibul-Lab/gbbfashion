import type { ShopMode } from '@/lib/categories'
import { resolveShopMode } from '@/lib/categories'

export interface ShopRouteParams {
  category: string
  subCategory?: string | null
  shopMode?: ShopMode
}

export function buildShopPath(
  category: string,
  subCategory?: string | null,
  shopMode?: ShopMode
): string {
  const mode = shopMode ?? resolveShopMode(category)

  if (mode === 'new-arrivals') return '/collections/new-arrivals'
  if (mode === 'prime-drop') return '/collections/prime-drop'
  if (category === 'all' || !category) return '/collections'

  if (subCategory) return `/collections/${category}/${subCategory}`
  return `/collections/${category}`
}

export function parseShopSlug(slug: string[] | undefined): ShopRouteParams {
  if (!slug || slug.length === 0) {
    return { category: 'all', shopMode: 'browse' }
  }

  const [first, second] = slug

  if (first === 'new-arrivals') {
    return { category: 'new-arrivals', shopMode: 'new-arrivals' }
  }
  if (first === 'prime-drop') {
    return { category: 'prime-drop', shopMode: 'prime-drop' }
  }

  if (second) {
    return { category: first, subCategory: second, shopMode: 'category' }
  }

  return { category: first, shopMode: resolveShopMode(first) }
}

export function syncShopUrl(
  category: string,
  subCategory: string | null,
  shopMode: ShopMode
) {
  if (typeof window === 'undefined') return

  const path = buildShopPath(category, subCategory, shopMode)
  if (window.location.pathname !== path) {
    window.history.pushState({ shop: true }, '', path)
  }
}
