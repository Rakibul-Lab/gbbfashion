'use client'

import { AppShell } from '@/components/app-shell'

export function CollectionsClient({ slug }: { slug?: string[] }) {
  return <AppShell collectionSlug={slug} />
}
