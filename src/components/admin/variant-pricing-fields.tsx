'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { VariantPricingMode } from '@/lib/product-colors'

type VariantPricingFieldsProps = {
  mode: VariantPricingMode | undefined
  price?: number
  originalPrice?: number | null
  onModeChange: (mode: VariantPricingMode) => void
  onPriceChange: (price: number | undefined) => void
  onOriginalPriceChange: (originalPrice: number | null | undefined) => void
  currencySymbol: string
  /** Shown when mode is base — e.g. product or parent color pricing */
  basePrice: number
  baseOriginalPrice?: number | null
  compact?: boolean
  idPrefix: string
}

function PricingModeToggle({
  mode,
  onChange,
  compact,
}: {
  mode: VariantPricingMode
  onChange: (mode: VariantPricingMode) => void
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-slate-200 bg-white p-0.5',
        compact ? 'h-8' : 'h-9'
      )}
      role="group"
      aria-label="Pricing mode"
    >
      {(['base', 'custom'] as const).map((option) => {
        const active = mode === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-md px-2.5 text-xs font-medium capitalize transition-colors',
              compact ? 'h-7' : 'h-8',
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export function VariantPricingFields({
  mode = 'base',
  price,
  originalPrice,
  onModeChange,
  onPriceChange,
  onOriginalPriceChange,
  currencySymbol,
  basePrice,
  baseOriginalPrice,
  compact,
  idPrefix,
}: VariantPricingFieldsProps) {
  const isCustom = mode === 'custom'

  return (
    <div className={cn('w-full', compact ? 'space-y-2' : 'space-y-2.5')}>
      <div className="flex w-full items-center justify-between gap-3">
        <Label className={cn('text-slate-600 shrink-0', compact ? 'text-[11px]' : 'text-xs')}>
          Pricing
        </Label>
        <PricingModeToggle mode={mode} onChange={onModeChange} compact={compact} />
      </div>

      {isCustom ? (
        <div
          className={cn(
            'grid w-full gap-2',
            compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
          )}
        >
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-price`} className="text-[11px] text-slate-500">
              Price ({currencySymbol})
            </Label>
            <Input
              id={`${idPrefix}-price`}
              type="number"
              min={0}
              step={1}
              value={typeof price === 'number' && Number.isFinite(price) ? price : ''}
              onChange={(e) => {
                const raw = e.target.value.trim()
                onPriceChange(raw === '' ? undefined : Math.max(0, Number(raw) || 0))
              }}
              placeholder="0"
              className={compact ? 'h-9 bg-white' : undefined}
              inputMode="decimal"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-compare`} className="text-[11px] text-slate-500">
              Compare-at ({currencySymbol})
            </Label>
            <Input
              id={`${idPrefix}-compare`}
              type="number"
              min={0}
              step={1}
              value={
                originalPrice === null || originalPrice === undefined
                  ? ''
                  : originalPrice
              }
              onChange={(e) => {
                const raw = e.target.value.trim()
                onOriginalPriceChange(raw === '' ? null : Math.max(0, Number(raw) || 0))
              }}
              placeholder="Optional"
              className={compact ? 'h-9 bg-white' : undefined}
              inputMode="decimal"
            />
          </div>
        </div>
      ) : (
        <p className="w-full text-[11px] text-slate-500 leading-relaxed rounded-md bg-white/80 border border-slate-100 px-2.5 py-2">
          Uses base price{' '}
          <span className="font-medium text-slate-800">
            {currencySymbol}
            {basePrice.toLocaleString()}
          </span>
          {baseOriginalPrice != null && baseOriginalPrice > basePrice ? (
            <>
              {' '}
              · compare-at{' '}
              <span className="font-medium text-slate-800">
                {currencySymbol}
                {baseOriginalPrice.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-slate-400"> · no compare-at</span>
          )}
        </p>
      )}
    </div>
  )
}
