export type ReelColorVariant = {
  name: string
  hex: string
  image: string
}

export function parseReelColors(raw: string | null | undefined): ReelColorVariant[] {
  if (!raw?.trim()) return []
  const trimmed = raw.trim()

  // New format: JSON array
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (!Array.isArray(parsed)) return []
      return parsed
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const row = item as Record<string, unknown>
          const name = typeof row.name === 'string' ? row.name.trim() : ''
          const hex =
            typeof row.hex === 'string'
              ? row.hex.trim()
              : typeof row.swatch === 'string'
                ? row.swatch.trim()
                : '#888888'
          const image = typeof row.image === 'string' ? row.image.trim() : ''
          if (!name && !image && !hex) return null
          return {
            name: name || 'Color',
            hex: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : '#888888',
            image,
          }
        })
        .filter((v): v is ReelColorVariant => !!v)
    } catch {
      return []
    }
  }

  // Legacy: comma-separated hex values
  return trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((hex, i) => ({
      name: `Color ${i + 1}`,
      hex: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : '#888888',
      image: '',
    }))
}

export function serializeReelColors(variants: ReelColorVariant[]): string | null {
  const cleaned = variants
    .map((v) => ({
      name: v.name.trim() || 'Color',
      hex: v.hex.trim() || '#888888',
      image: v.image.trim(),
    }))
    .filter((v) => v.name || v.image || v.hex)
  if (cleaned.length === 0) return null
  return JSON.stringify(cleaned)
}
