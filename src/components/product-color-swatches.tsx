'use client'

import { cn } from '@/lib/utils'
import type { ProductColorVariant } from '@/lib/product-colors'

type ProductColorSwatchesProps = {
  variants: ProductColorVariant[]
  selectedName: string
  /** Pass null to clear selection and restore the featured product image */
  onSelect: (variant: ProductColorVariant | null) => void
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  /** Stop card navigation when clicking swatches in listings */
  stopPropagation?: boolean
  /** Allow clearing selection (click selected / double-click). Default true. */
  allowDeselect?: boolean
}

export function ProductColorSwatches({
  variants,
  selectedName,
  onSelect,
  size = 'md',
  showLabel = false,
  className,
  stopPropagation = false,
  allowDeselect = true,
}: ProductColorSwatchesProps) {
  if (variants.length === 0) return null

  const dim =
    size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-9 w-9' : 'h-7 w-7'
  const selected = variants.find(
    (v) => v.name.toLowerCase() === selectedName.toLowerCase()
  )

  const guard = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <p className="text-sm text-slate-600">
          Color:{' '}
          <span className="font-medium text-slate-900">
            {selected?.name || selectedName || 'Default'}
          </span>
        </p>
      )}
      <div
        className="flex flex-wrap items-center gap-2"
        role="radiogroup"
        aria-label="Choose color"
      >
        {variants.map((variant) => {
          const isActive =
            variant.name.toLowerCase() === selectedName.toLowerCase()
          const isLight =
            /^#(fff|ffffff|f5f5f5|fafafa|f5f0e6|eeeeee)$/i.test(variant.swatch)
          return (
            <button
              key={variant.name}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={
                isActive && allowDeselect
                  ? `${variant.name} (click again to clear)`
                  : variant.name
              }
              aria-label={variant.name}
              onClick={(e) => {
                guard(e)
                if (allowDeselect && isActive) {
                  onSelect(null)
                  return
                }
                onSelect(variant)
              }}
              className={cn(
                dim,
                'relative rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
                isActive
                  ? 'border-slate-900 scale-110 shadow-sm'
                  : 'border-transparent hover:border-slate-300',
                isLight && 'ring-1 ring-inset ring-slate-200'
              )}
              style={{ backgroundColor: variant.swatch }}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full ring-2 ring-offset-1 ring-slate-900/20" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
