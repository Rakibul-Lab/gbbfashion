import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { absoluteUrl, getAllCollectionPaths } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
  {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  const collectionPages: MetadataRoute.Sitemap = getAllCollectionPaths().map((slug) => ({
    url: absoluteUrl(slug ? `/collections/${slug}` : '/collections'),
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: slug.includes('/') ? 0.75 : 0.85,
  }))

  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await db.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    productPages = products.map((product) => ({
      url: absoluteUrl(`/products/${product.id}`),
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Database may be unavailable during build
  }

  return [...staticPages, ...collectionPages, ...productPages]
}
