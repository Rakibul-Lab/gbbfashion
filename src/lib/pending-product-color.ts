/** One-shot handoff: listing color → product detail (not persisted). */

let pendingProductColor: string | null = null

export function setPendingProductColor(color: string | null | undefined) {
  const value = typeof color === 'string' ? color.trim() : ''
  pendingProductColor = value && value !== 'Default' ? value : null
}

/** Read and clear the pending color from the previous listing selection. */
export function consumePendingProductColor(): string | null {
  const value = pendingProductColor
  pendingProductColor = null
  return value
}
