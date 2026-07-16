import { db } from '@/lib/db'
import { productSlugFromFields, slugify } from '@/lib/product-slug'

export async function allocateUniqueProductSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const root = slugify(base)
  let candidate = root
  let n = 2

  while (true) {
    const existing = await db.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate
    }
    candidate = `${root}-${n}`
    n += 1
    if (n > 500) {
      return `${root}-${Date.now().toString(36)}`
    }
  }
}

export async function resolveProductSlugInput(opts: {
  name: string
  image?: string | null
  excludeId?: string
}) {
  const base = productSlugFromFields({ name: opts.name, image: opts.image })
  return allocateUniqueProductSlug(base, opts.excludeId)
}

/** Find product by public URL param (slug preferred, id still works). */
export async function findProductByParam(param: string) {
  const key = String(param || '').trim()
  if (!key) return null

  const bySlug = await db.product.findUnique({ where: { slug: key } })
  if (bySlug) return bySlug

  return db.product.findUnique({ where: { id: key } })
}
