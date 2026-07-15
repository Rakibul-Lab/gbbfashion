'use client'

import { useEffect } from 'react'
import { AppShell } from '@/components/app-shell'
import { useStore } from '@/lib/store'

export function ProductClient({ productId }: { productId: string }) {
  const selectProduct = useStore((s) => s.selectProduct)
  const setView = useStore((s) => s.setView)

  useEffect(() => {
    selectProduct(productId)
    setView('product', { syncUrl: false })
  }, [productId, selectProduct, setView])

  return <AppShell />
}
