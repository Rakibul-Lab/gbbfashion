'use client'

import type { WhatsAppIconId } from '@/lib/site-settings-client'

const GLYPH =
  'M16.004 3C9.382 3 4 8.374 4 14.986c0 2.11.55 4.16 1.596 5.975L4 29l8.223-2.154A12.02 12.02 0 0 0 16.004 27C22.626 27 28 21.626 28 14.986 28 8.374 22.626 3 16.004 3zm0 21.9a9.86 9.86 0 0 1-5.02-1.375l-.36-.214-4.88 1.28 1.302-4.754-.234-.388A9.84 9.84 0 0 1 6.15 14.986c0-5.423 4.426-9.84 9.854-9.84 5.427 0 9.853 4.417 9.853 9.84 0 5.43-4.426 9.914-9.853 9.914zm5.402-7.37c-.296-.148-1.753-.865-2.024-.964-.272-.1-.47-.148-.668.148-.197.296-.767.964-.94 1.162-.173.197-.346.222-.642.074-.296-.148-1.25-.46-2.38-1.467-.88-.783-1.474-1.75-1.647-2.046-.173-.296-.018-.456.13-.603.134-.133.296-.346.444-.52.148-.173.197-.296.296-.494.099-.197.05-.37-.025-.52-.074-.148-.668-1.61-.916-2.205-.241-.579-.487-.5-.668-.51l-.57-.01c-.197 0-.52.074-.792.37-.272.296-1.04 1.015-1.04 2.476s1.065 2.872 1.213 3.07c.148.197 2.096 3.2 5.078 4.486.71.306 1.264.49 1.696.626.712.226 1.36.194 1.872.118.571-.086 1.753-.717 2.001-1.41.247-.692.247-1.286.173-1.41-.074-.123-.272-.197-.57-.346z'

type Props = {
  iconId: WhatsAppIconId
  iconUrl?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14 sm:h-16 sm:w-16',
  lg: 'h-16 w-16',
}

function Glyph({ className, fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill={fill} aria-hidden="true">
      <path d={GLYPH} />
    </svg>
  )
}

export function WhatsAppIconButton({
  iconId,
  iconUrl = '',
  className = '',
  size = 'md',
}: Props) {
  const dim = sizeMap[size]

  if (iconId === 'custom' && iconUrl) {
    return (
      <span
        className={`${dim} inline-flex overflow-hidden rounded-full bg-white shadow-lg shadow-emerald-900/20 ${className}`}
      >
        <img src={iconUrl} alt="" className="h-full w-full object-cover" />
      </span>
    )
  }

  if (iconId === 'soft') {
    return (
      <span
        className={`${dim} inline-flex items-center justify-center rounded-full bg-[#dcf8c6] text-[#128C7E] shadow-lg shadow-emerald-900/15 ${className}`}
      >
        <Glyph className="h-[58%] w-[58%]" />
      </span>
    )
  }

  if (iconId === 'dark') {
    return (
      <span
        className={`${dim} inline-flex items-center justify-center rounded-full bg-slate-900 text-[#25D366] shadow-lg shadow-slate-900/30 ${className}`}
      >
        <Glyph className="h-[58%] w-[58%]" />
      </span>
    )
  }

  if (iconId === 'square') {
    return (
      <span
        className={`${dim} inline-flex items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-emerald-900/25 ${className}`}
      >
        <Glyph className="h-[58%] w-[58%]" />
      </span>
    )
  }

  if (iconId === 'outline') {
    return (
      <span
        className={`${dim} inline-flex items-center justify-center rounded-full border-[3px] border-[#25D366] bg-white text-[#25D366] shadow-lg shadow-emerald-900/15 ${className}`}
      >
        <Glyph className="h-[52%] w-[52%]" />
      </span>
    )
  }

  if (iconId === 'gradient') {
    return (
      <span
        className={`${dim} inline-flex items-center justify-center rounded-full text-white shadow-lg shadow-emerald-900/25 ${className}`}
        style={{
          background: 'linear-gradient(145deg, #25D366 0%, #128C7E 55%, #075E54 100%)',
        }}
      >
        <Glyph className="h-[58%] w-[58%]" />
      </span>
    )
  }

  // classic (default)
  return (
    <span
      className={`${dim} inline-flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/25 ${className}`}
    >
      <Glyph className="h-[58%] w-[58%]" />
    </span>
  )
}
