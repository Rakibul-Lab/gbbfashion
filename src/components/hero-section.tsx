'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, RotateCcw, Banknote } from 'lucide-react'
import { useCurrency } from '@/hooks/use-currency'
import { useStoreCommerce } from '@/hooks/use-store-commerce'
import {
  DEFAULT_HERO_MEDIA_TYPE,
  DEFAULT_HERO_MEDIA_URL,
  type HeroMediaType,
} from '@/lib/site-settings-client'
import { collectFrontProductImages } from '@/lib/section-media'

export function HeroSection() {
  const [mediaType, setMediaType] = useState<HeroMediaType>(DEFAULT_HERO_MEDIA_TYPE)
  const [mediaUrl, setMediaUrl] = useState(DEFAULT_HERO_MEDIA_URL)
  const { format } = useCurrency()
  const { freeDeliveryMin } = useStoreCommerce()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/settings', { cache: 'no-store' }),
          fetch('/api/products', { cache: 'no-store' }),
        ])
        const data = settingsRes.ok ? await settingsRes.json() : null
        const products = productsRes.ok ? await productsRes.json() : []
        if (cancelled) return

        const configuredType = data?.heroMediaType === 'video' ? 'video' : 'image'
        const configuredUrl =
          typeof data?.heroMediaUrl === 'string' ? data.heroMediaUrl.trim() : DEFAULT_HERO_MEDIA_URL

        if (configuredUrl) {
          setMediaType(configuredType)
          setMediaUrl(configuredUrl)
          return
        }

        const featured = Array.isArray(products) ? collectFrontProductImages(products) : []
        setMediaType('image')
        setMediaUrl(featured[0] || DEFAULT_HERO_MEDIA_URL)
      } catch {
        // keep defaults
      }
    }

    void load()

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ heroMediaType?: HeroMediaType; heroMediaUrl?: string }>)
        .detail
      if (!detail) return
      if (detail.heroMediaType) setMediaType(detail.heroMediaType)
      if (detail.heroMediaUrl !== undefined) {
        const next = detail.heroMediaUrl.trim()
        if (next) {
          setMediaUrl(next)
          return
        }
        // Cleared hero — fall back to featured product image
        void fetch('/api/products', { cache: 'no-store' })
          .then((res) => (res.ok ? res.json() : []))
          .then((products) => {
            if (cancelled) return
            const featured = Array.isArray(products) ? collectFrontProductImages(products) : []
            setMediaType('image')
            setMediaUrl(featured[0] || '')
          })
          .catch(() => undefined)
      }
    }

    window.addEventListener('site-settings-updated', onUpdated as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener('site-settings-updated', onUpdated as EventListener)
    }
  }, [])

  // Keep hero video playing continuously (autoplay + loop; resume if interrupted)
  useEffect(() => {
    if (mediaType !== 'video' || !mediaUrl) return
    const video = videoRef.current
    if (!video) return

    const tryPlay = () => {
      video.muted = true
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => undefined)
      }
    }

    const onEnded = () => {
      video.currentTime = 0
      tryPlay()
    }

    tryPlay()
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    video.addEventListener('ended', onEnded)

    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') tryPlay()
    }
    document.addEventListener('visibilitychange', visibilityHandler)

    return () => {
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('ended', onEnded)
      document.removeEventListener('visibilitychange', visibilityHandler)
    }
  }, [mediaType, mediaUrl])

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[55dvh] sm:h-[70dvh] lg:h-[min(100dvh,900px)] min-h-[280px] sm:min-h-[400px] max-h-[900px] bg-slate-900">
        {mediaUrl ? (
          mediaType === 'video' ? (
            <video
              key={mediaUrl}
              ref={videoRef}
              src={mediaUrl}
              className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              aria-label="GBB Fashion hero video"
            />
          ) : (
            <img
              key={mediaUrl}
              src={mediaUrl}
              alt="GBB Fashion hero"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )
        ) : null}
      </div>

      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="py-4 sm:py-5 text-center flex items-center justify-center gap-3"
            >
              <Truck className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] tracking-wider uppercase text-white/40">Free Shipping</p>
                <p className="text-xs sm:text-sm font-semibold mt-0.5">
                  On Orders Over {format(freeDeliveryMin)}
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="py-4 sm:py-5 text-center flex items-center justify-center gap-3"
            >
              <RotateCcw className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] tracking-wider uppercase text-white/40">Easy Returns</p>
                <p className="text-xs sm:text-sm font-semibold mt-0.5">7-Day Return Policy</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="py-4 sm:py-5 text-center flex items-center justify-center gap-3"
            >
              <Banknote className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] tracking-wider uppercase text-white/40">Cash on Delivery</p>
                <p className="text-xs sm:text-sm font-semibold mt-0.5">Pay When You Receive</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
