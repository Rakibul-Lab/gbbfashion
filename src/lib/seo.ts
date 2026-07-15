import type { Metadata } from 'next'
import {
  getShopPageConfig,
  getSubCategoryLabel,
  navCategories,
  resolveShopMode,
  categorySubCategories,
} from '@/lib/categories'
import { parseShopSlug } from '@/lib/shop-navigation'

export const siteConfig = {
  name: 'GBB Fashion',
  title: 'GBB Fashion — Premium Leather Bags, Shoes & Accessories',
  description:
    'Shop premium leather bags, shoes, belts, and accessories at GBB Fashion. New arrivals, prime drops, and curated collections for men, women, and kids.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'en_US',
  keywords: [
    'GBB Fashion',
    'leather bags',
    'handbags',
    'crossbody bags',
    'shoulder bags',
    'men bags',
    'women bags',
    'shoes',
    'loafers',
    'sneakers',
    'belts',
    'accessories',
    'Bangladesh fashion',
    'online shopping',
    'prime drop',
    'new arrivals',
  ],
}

export function absoluteUrl(path = '/') {
  const base = siteConfig.url.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const url = absoluteUrl(path)
  const ogImage = image ? absoluteUrl(image) : absoluteUrl('/hero-mothers-day.jpg')

  return {
    title,
    description,
    keywords: siteConfig.keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export function getCollectionPath(slug?: string[]) {
  if (!slug || slug.length === 0) return '/collections'
  return `/collections/${slug.join('/')}`
}

export function generateCollectionMetadata(slug?: string[]): Metadata {
  const params = parseShopSlug(slug)
  const path = getCollectionPath(slug)
  const config = getShopPageConfig(
    params.shopMode ?? resolveShopMode(params.category),
    params.category,
    params.subCategory ?? null
  )

  const title = config.title
  const description =
    config.description ??
    `Browse ${config.title.toLowerCase()} at ${siteConfig.name}. ${config.subtitle}.`

  return buildPageMetadata({
    title,
    description,
    path,
    image: config.heroImageLeft ?? '/hero-mothers-day.jpg',
  })
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/uploads/logo.png'),
    description: siteConfig.description,
    sameAs: [],
  }
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/collections')}?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function getCollectionJsonLd(slug?: string[]) {
  const params = parseShopSlug(slug)
  const path = getCollectionPath(slug)
  const config = getShopPageConfig(
    params.shopMode ?? resolveShopMode(params.category),
    params.category,
    params.subCategory ?? null
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: config.title,
    description: config.description ?? config.subtitle,
    url: absoluteUrl(path),
    isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url },
  }
}

export function getProductJsonLd(product: {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: absoluteUrl(product.image),
    sku: product.id,
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/products/${product.id}`),
      priceCurrency: 'USD',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }
}

export function getBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function getAllCollectionPaths(): string[] {
  const paths = ['', ...navCategories.map((c) => c.value)]

  for (const cat of navCategories) {
    const subs = categorySubCategories[cat.value] ?? []
    for (const sub of subs) {
      paths.push(`${cat.value}/${sub.value}`)
    }
  }

  return [...new Set(paths)]
}

export function getProductMetadata(product: {
  id: string
  name: string
  description: string
  image: string
  category: string
  price: number
}): Metadata {
  const title = product.name
  const description =
    product.description.length > 155
      ? `${product.description.slice(0, 152)}...`
      : product.description

  return buildPageMetadata({
    title,
    description,
    path: `/products/${product.id}`,
    image: product.image,
  })
}

export function getProductBreadcrumbs(product: { id: string; name: string; category: string }) {
  const categoryLabel =
    navCategories.find((c) => c.value === product.category)?.label ?? product.category

  return getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: categoryLabel, path: `/collections/${product.category}` },
    { name: product.name, path: `/products/${product.id}` },
  ])
}
