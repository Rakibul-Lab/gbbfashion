'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src?: string | null
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  /**
   * fill = stretch to exact box (default — any upload fills container).
   * cover = crop to fill, contain = letterbox.
   */
  fit?: 'cover' | 'fill' | 'contain'
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 50vw, 25vw',
  fit = 'fill',
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false)
  const objectFit = fit

  const fitClass =
    objectFit === 'contain'
      ? 'object-contain'
      : objectFit === 'cover'
        ? 'object-cover'
        : 'object-fill'

  if (!src || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 to-slate-200 ${fill ? 'absolute inset-0 h-full w-full' : ''} ${className ?? ''}`}
        aria-hidden={!alt}
      />
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`absolute inset-0 !h-full !w-full ${fitClass} object-center ${className ?? ''}`}
        style={{ objectFit, objectPosition: 'center' }}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      sizes={sizes}
      priority={priority}
      className={`${fitClass} ${className ?? ''}`}
      style={{ objectFit, objectPosition: 'center', width: '100%', height: '100%' }}
      onError={() => setFailed(true)}
    />
  )
}
