'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

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

/** Local uploads must bypass Next image optimizer on cPanel/standalone —
 * newly written files often 404 through /_next/image until the app restarts. */
function isLocalUpload(src: string) {
  const clean = src.split('?')[0]
  return clean.startsWith('/uploads/')
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

  useEffect(() => {
    setFailed(false)
  }, [src])

  const fitClass =
    fit === 'contain'
      ? 'object-contain'
      : fit === 'cover'
        ? 'object-cover'
        : 'object-fill'

  if (!src || failed) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-slate-100 to-slate-200',
          fill && 'absolute inset-0 h-full w-full',
          className
        )}
        aria-hidden={!alt}
      />
    )
  }

  // Admin / user uploads: native <img> — immediate after upload, no optimizer lag
  if (isLocalUpload(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'absolute inset-0 !h-full !w-full object-center',
            fitClass,
            className
          )}
          style={{ objectFit: fit, objectPosition: 'center' }}
          onError={() => setFailed(true)}
        />
      )
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={src}
        src={src}
        alt={alt}
        width={width ?? 400}
        height={height ?? 400}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(fitClass, className)}
        style={{
          objectFit: fit,
          objectPosition: 'center',
          width: '100%',
          height: '100%',
        }}
        onError={() => setFailed(true)}
      />
    )
  }

  if (fill) {
    return (
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          'absolute inset-0 !h-full !w-full object-center',
          fitClass,
          className
        )}
        style={{ objectFit: fit, objectPosition: 'center' }}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      sizes={sizes}
      priority={priority}
      className={cn(fitClass, className)}
      style={{
        objectFit: fit,
        objectPosition: 'center',
        width: '100%',
        height: '100%',
      }}
      onError={() => setFailed(true)}
    />
  )
}
