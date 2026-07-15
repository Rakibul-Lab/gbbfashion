/** Normalize inventory quantity from API / form input. */
export function normalizeStock(value: unknown, fallback = 0): number {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? parseInt(value, 10)
        : NaN
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

/** Catalog availability is derived from remaining units. */
export function inStockFromQuantity(stock: number): boolean {
  return stock > 0
}
