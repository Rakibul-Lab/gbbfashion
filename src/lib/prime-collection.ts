'use client'

/**
 * Normalize admin / seed collection values to homepage Prime Bags / Shoes tabs.
 */
export function normalizePrimeCollection(
  raw: string | null | undefined
): 'bags' | 'shoes' | null {
  if (!raw?.trim()) return null
  const v = raw.trim().toLowerCase()
  if (v === 'bags' || v === 'prime bags' || v === 'prime-bags') return 'bags'
  if (v === 'shoes' || v === 'prime shoes' || v === 'prime-shoes') return 'shoes'
  return null
}
