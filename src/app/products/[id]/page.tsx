import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { db } from '@/lib/db'
import { getProductBreadcrumbs, getProductJsonLd, getProductMetadata } from '@/lib/seo'
import { ProductClient } from './product-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })
  if (!product) return { title: 'Product Not Found' }
  return getProductMetadata(product)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })

  if (!product) notFound()

  return (
    <>
      <JsonLd data={getProductJsonLd(product)} />
      <JsonLd data={getProductBreadcrumbs(product)} />
      <ProductClient productId={id} />
    </>
  )
}
