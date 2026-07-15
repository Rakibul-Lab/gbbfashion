'use client'

import { useCallback, useEffect, useState } from 'react'
import type { NavCategory } from '@/lib/categories'
import { navCategories as fallbackNav } from '@/lib/categories'

type ApiCategory = {
  slug: string
  label: string
  highlight: boolean
  showInNav: boolean
  specialType: string | null
  sortOrder: number
  subcategories: { slug: string; label: string; sortOrder: number }[]
}

function toNav(categories: ApiCategory[]): NavCategory[] {
  return categories
    .filter((c) => c.showInNav)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      value: c.slug,
      label: c.label,
      highlight: c.highlight || undefined,
      subcategories: (c.subcategories || [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s) => ({ value: s.slug, label: s.label })),
    }))
}

/** Loads nav categories from admin CMS with static fallback */
export function useNavCategories() {
  const [categories, setCategories] = useState<NavCategory[]>(fallbackNav)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/categories?nav=1', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as ApiCategory[]
      if (Array.isArray(data) && data.length > 0) {
        setCategories(toNav(data))
      }
    } catch {
      // keep fallback
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { categories, loaded, refresh }
}
