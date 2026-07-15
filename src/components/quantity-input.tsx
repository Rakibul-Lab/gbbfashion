'use client'

import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuantityInputProps = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  className?: string
  size?: 'sm' | 'md'
}

/** Quantity control — typing and +/- both work */
export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 999,
  className,
  size = 'md',
}: QuantityInputProps) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const clamp = (n: number) => {
    if (!Number.isFinite(n)) return min
    return Math.min(max, Math.max(min, Math.trunc(n)))
  }

  const apply = (next: number) => {
    const clamped = clamp(next)
    setDraft(String(clamped))
    onChange(clamped)
  }

  const commitDraft = () => {
    const digits = draft.replace(/[^\d]/g, '')
    if (!digits) {
      apply(min)
      return
    }
    apply(parseInt(digits, 10))
  }

  const step = (delta: number) => {
    apply(value + delta)
  }

  const h = size === 'sm' ? 'h-8' : 'h-11'
  const btnW = size === 'sm' ? 'w-8' : 'w-9 sm:w-10'
  const inputW = size === 'sm' ? 'w-10' : 'w-10 sm:w-12'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div
      className={cn(
        'inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white',
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        // preventDefault keeps focus change from eating the click when the input was focused
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => step(-1)}
        disabled={value <= min}
        className={cn(
          h,
          btnW,
          'inline-flex items-center justify-center shrink-0 text-slate-700',
          'hover:bg-slate-50 active:bg-slate-100 transition-colors',
          'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed'
        )}
      >
        <Minus className={icon} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Quantity"
        value={draft}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d]/g, '')
          setDraft(next)
          if (!next) return
          const parsed = parseInt(next, 10)
          if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
            onChange(parsed)
          }
        }}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commitDraft()
            ;(e.target as HTMLInputElement).blur()
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            step(1)
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            step(-1)
          }
        }}
        className={cn(
          inputW,
          h,
          'border-0 bg-transparent text-center font-medium tabular-nums text-slate-900',
          'focus:outline-none focus:ring-0',
          size === 'sm' ? 'text-sm' : 'text-sm sm:text-base'
        )}
      />

      <button
        type="button"
        aria-label="Increase quantity"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => step(1)}
        disabled={value >= max}
        className={cn(
          h,
          btnW,
          'inline-flex items-center justify-center shrink-0 text-slate-700',
          'hover:bg-slate-50 active:bg-slate-100 transition-colors',
          'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed'
        )}
      >
        <Plus className={icon} />
      </button>
    </div>
  )
}
