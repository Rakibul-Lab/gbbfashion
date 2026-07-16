'use client'

import type { SectionMediaSlot } from '@/lib/section-media'
import { cn } from '@/lib/utils'

type Props = {
  media: SectionMediaSlot
  alt: string
  className?: string
  /** object-fit for img/video */
  fit?: 'cover' | 'fill' | 'contain'
  priority?: boolean
}

/** Renders a section slot as looping video or image. */
export function SectionMedia({
  media,
  alt,
  className,
  fit = 'cover',
  priority = false,
}: Props) {
  const fitClass =
    fit === 'fill' ? 'object-fill' : fit === 'contain' ? 'object-contain' : 'object-cover'

  if (!media?.url) {
    return null
  }

  if (media.type === 'video') {
    return (
      <video
        src={media.url}
        className={cn('h-full w-full', fitClass, className)}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={alt}
      className={cn('h-full w-full', fitClass, className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

/** Absolute fill media for parent with relative + overflow hidden */
export function SectionMediaFill({
  media,
  alt,
  className,
  fit = 'cover',
  priority = false,
}: Props) {
  return (
    <SectionMedia
      media={media}
      alt={alt}
      fit={fit}
      priority={priority}
      className={cn('absolute inset-0', className)}
    />
  )
}
