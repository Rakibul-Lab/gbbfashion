/** URL-safe slug helpers — product links follow the featured image filename when possible. */

export function slugify(input: string): string {
  const slug = String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'product'
}

/** Timestamp-style uploads like primary-1783938798569 are not useful as URLs. */
export function isGenericMediaSlug(slug: string): boolean {
  return /^(primary|gallery|product|image|file|media|photo|img|video|icon|logo|hero|poster)-\d+$/i.test(
    slug
  )
}

/** Basename of an image URL without extension, or null if generic/empty. */
export function slugFromImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const pathOnly = String(url).split('?')[0].replace(/\\/g, '/')
  const base = pathOnly.split('/').pop() || ''
  const withoutExt = base.replace(/\.[a-z0-9]+$/i, '')
  const slug = slugify(withoutExt)
  if (!slug || isGenericMediaSlug(slug)) return null
  return slug
}

/** Prefer image filename; fall back to product name. */
export function productSlugFromFields(opts: {
  name: string
  image?: string | null
}): string {
  return slugFromImageUrl(opts.image) || slugify(opts.name)
}

export function productUrlPath(product: { id: string; slug?: string | null }) {
  const slug = typeof product.slug === 'string' ? product.slug.trim() : ''
  return `/products/${slug || product.id}`
}

/** Sanitize an uploaded original filename into `name.ext` (no timestamp prefix). */
export function filenameFromOriginal(originalName: string, ext: string): string {
  const base = String(originalName || '')
    .split(/[/\\]/)
    .pop()
    ?.replace(/\.[^.]+$/, '')
  const slug = slugify(base || 'file')
  const safeExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
  return `${slug}${safeExt}`
}
