import type { Metadata } from 'next'
import { JsonLd } from '@/components/json-ld'
import { generateCollectionMetadata, getCollectionJsonLd } from '@/lib/seo'
import { CollectionsClient } from './collections-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  return generateCollectionMetadata(slug)
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params

  return (
    <>
      <JsonLd data={getCollectionJsonLd(slug)} />
      <CollectionsClient slug={slug} />
    </>
  )
}
