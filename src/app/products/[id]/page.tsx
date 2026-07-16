import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { findProductByParam } from '@/lib/product-slug-db'
import { productUrlPath } from '@/lib/product-slug'
import { getProductBreadcrumbs, getProductJsonLd, getProductMetadata } from '@/lib/seo'
import { ProductClient } from './product-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await findProductByParam(id)
  if (!product) return { title: 'Product Not Found' }
  return getProductMetadata(product)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await findProductByParam(id)

  if (!product) notFound()

  const canonical = productUrlPath(product)
  if (id !== product.slug && product.slug) {
    permanentRedirect(canonical)
  }

  return (
    <>
      <JsonLd data={getProductJsonLd(product)} />
      <JsonLd data={getProductBreadcrumbs(product)} />
      <ProductClient productId={product.id} />
    </>
  )
}
