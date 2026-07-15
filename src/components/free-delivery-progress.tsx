'use client'

import { Truck } from 'lucide-react'
import { useCurrency } from '@/hooks/use-currency'
import { cn } from '@/lib/utils'

type FreeDeliveryProgressProps = {
  subtotal: number
  freeDeliveryMin: number
  className?: string
}

/** Progress toward free delivery threshold (cart / checkout) */
export function FreeDeliveryProgress({
  subtotal,
  freeDeliveryMin,
  className,
}: FreeDeliveryProgressProps) {
  const { format } = useCurrency()
  const threshold = Math.max(0, Number(freeDeliveryMin) || 0)
  if (threshold <= 0) return null

  const remaining = Math.max(0, Math.round((threshold - subtotal) * 100) / 100)
  const unlocked = remaining <= 0
  const progress = Math.min(100, Math.max(0, (subtotal / threshold) * 100))

  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-amber-400/80 bg-[#fffdf8] px-4 py-4',
        className
      )}
    >
      <div className="relative mx-auto h-2.5 w-full max-w-md rounded-full bg-stone-200/90">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-500 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-amber-500 bg-white shadow-sm transition-[left] duration-500 ease-out"
          style={{
            left: `clamp(0px, calc(${progress}% - 16px), calc(100% - 32px))`,
          }}
        >
          <Truck className="h-3.5 w-3.5 text-amber-600" strokeWidth={2.25} />
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-stone-700">
        {unlocked ? (
          <>
            You unlocked{' '}
            <span className="font-bold uppercase tracking-wide text-amber-700">
              Free Delivery
            </span>
            !
          </>
        ) : (
          <>
            Add items worth{' '}
            <span className="font-bold text-stone-900">{format(remaining)}</span> for{' '}
            <span className="font-bold uppercase tracking-wide">Free Delivery</span>!
          </>
        )}
      </p>
    </div>
  )
}
