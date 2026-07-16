/**
 * Backfill Product.slug from featured image filename (fallback: product name).
 * Usage: node scripts/backfill-product-slugs.mjs
 * Requires DATABASE_URL and that the `slug` column already exists.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function slugify(input) {
  const slug = String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || 'product'
}

function isGeneric(slug) {
  return /^(primary|gallery|product|image|file|media|photo|img|video|icon|logo|hero|poster)-\d+$/i.test(
    slug
  )
}

function fromImage(url) {
  if (!url) return null
  const base =
    String(url)
      .split('?')[0]
      .replace(/\\/g, '/')
      .split('/')
      .pop() || ''
  const withoutExt = base.replace(/\.[a-z0-9]+$/i, '')
  const slug = slugify(withoutExt)
  if (!slug || isGeneric(slug)) return null
  return slug
}

const products = await db.product.findMany({
  select: { id: true, name: true, image: true, slug: true },
})
const used = new Set(products.map((p) => p.slug).filter(Boolean))
let updated = 0

for (const p of products) {
  const base = fromImage(p.image) || slugify(p.name)
  let candidate = base
  let n = 2
  while (used.has(candidate) && candidate !== p.slug) {
    candidate = `${base}-${n++}`
  }
  used.add(candidate)
  if (p.slug !== candidate) {
    await db.product.update({ where: { id: p.id }, data: { slug: candidate } })
    updated++
    console.log(`${p.name} -> ${candidate}`)
  }
}

console.log(`Updated ${updated} of ${products.length}`)
await db.$disconnect()
