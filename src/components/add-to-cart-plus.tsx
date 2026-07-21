'use client'

import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  colorHasSizes,
  parseGalleryImages,
  resolveProductColorVariants,
} from '@/lib/product-colors'
import { setPendingProductColor } from '@/lib/pending-product-color'

type AddToCartPlusProps = {
  productId: string
  name: string
  price: number
  image: string
  color?: string | null
  colorSwatch?: string | null
  className?: string
  size?: 'sm' | 'md'
}

function looksLikeDbId(id: string) {
  return /^c[a-z0-9]{20,}$/i.test(id)
}

export function AddToCartPlus({
  productId,
  name,
  price,
  image,
  color,
  colorSwatch,
  className,
  size = 'md',
}: AddToCartPlusProps) {
  const addToCart = useStore((s) => s.addToCart)
  const setView = useStore((s) => s.setView)
  const selectProduct = useStore((s) => s.selectProduct)

  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <button
      type="button"
      aria-label={`Add ${name} to cart`}
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()

        let finalId = productId
        let finalPrice = price
        let finalImage = image
        let finalName = name
        let finalColor = color
        let finalSwatch = colorSwatch
        let galleryImages: string | null = null
        let productPayload: Record<string, unknown> | null = null

        if (!looksLikeDbId(productId)) {
          try {
            const res = await fetch(`/api/products?search=${encodeURIComponent(name)}`)
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
              const exact = data.find(
                (p: { name: string }) => p.name.toLowerCase() === name.toLowerCase()
              )
              const match = exact || data[0]
              finalId = match.id
              finalPrice = match.price
              finalImage = match.image
              finalName = match.name
              galleryImages = match.galleryImages ?? null
              productPayload = match
            }
          } catch {
            // keep featured card data as fallback
          }
        } else {
          try {
            const res = await fetch(`/api/products/${finalId}`)
            const data = await res.json()
            if (data?.id) {
              galleryImages = data.galleryImages ?? null
              productPayload = data
            }
          } catch {
            // ignore
          }
        }

        const variants =
          productPayload != null
            ? resolveProductColorVariants(productPayload as Parameters<typeof resolveProductColorVariants>[0])
            : parseGalleryImages(galleryImages)

        if (variants.length > 0 && !finalColor) {
          setPendingProductColor(null)
          selectProduct(finalId)
          setView('product')
          toast.error('Please select a color')
          return
        }

        const active =
          variants.find(
            (v) =>
              finalColor &&
              v.name.toLowerCase() === String(finalColor).toLowerCase()
          ) || null

        if (active && colorHasSizes(active)) {
          setPendingProductColor(finalColor)
          selectProduct(finalId)
          setView('product')
          toast.error('Please select a size')
          return
        }

        addToCart({
          productId: finalId,
          name: finalName,
          price: finalPrice,
          image: finalImage,
          color: finalColor,
          colorSwatch: finalSwatch,
        })
        const label =
          finalColor && finalColor !== 'Default'
            ? `${finalName} (${finalColor})`
            : finalName
        toast.success(`${label} added to cart`, {
          action: {
            label: 'View Cart',
            onClick: () => setView('cart'),
          },
        })
      }}
      className={cn(
        dim,
        'inline-flex items-center justify-center rounded-full bg-slate-900 text-white shadow-md',
        'hover:bg-amber-600 transition-colors active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        className
      )}
    >
      <Plus className={icon} strokeWidth={2.5} />
    </button>
  )
}
