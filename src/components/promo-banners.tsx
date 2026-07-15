'use client'

import { useEffect, useState } from 'react'
import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useSectionMedia } from '@/hooks/use-section-media'
import { SectionMediaFill } from '@/components/section-media'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import {
  DEFAULT_PROMO_BANNERS,
  normalizePromoBanners,
  type PromoBannerConfig,
} from '@/lib/site-settings-client'

export function PromoBanners() {
  const { goToShop } = useShopNavigation()
  const { get } = useSectionMedia()
  const [banners, setBanners] = useState<PromoBannerConfig[]>(DEFAULT_PROMO_BANNERS)

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setBanners(normalizePromoBanners(data?.promoBanners))
      })
      .catch(() => undefined)

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ promoBanners?: PromoBannerConfig[] }>).detail
      if (detail?.promoBanners) {
        setBanners(normalizePromoBanners(detail.promoBanners))
      }
    }
    window.addEventListener('site-settings-updated', onUpdated as EventListener)
    return () => window.removeEventListener('site-settings-updated', onUpdated as EventListener)
  }, [])

  const enabled = banners.filter((b) => b.enabled)
  if (enabled.length === 0) return null

  return (
    <section className="w-full">
      {enabled.map((banner, index) => {
        const slotKey = banner.id === 'prime' || index === 0 ? 'promo_prime' : 'promo_second'
        const slot = get(slotKey)
        const media = {
          type: slot.url ? slot.type : banner.mediaType,
          url: slot.url || banner.mediaUrl || banner.image,
        }
        const alignRight = index % 2 === 1

        return (
          <div
            key={banner.id}
            className="relative w-full h-[42dvh] sm:h-[50dvh] lg:h-[55dvh] min-h-[260px] sm:min-h-[320px] overflow-hidden"
          >
            <div
              className="absolute inset-0 z-0"
              style={{
                background: alignRight
                  ? 'linear-gradient(135deg, #44403c 0%, #57534e 40%, #78716c 100%)'
                  : 'linear-gradient(135deg, #1c1917 0%, #292524 40%, #57534e 100%)',
              }}
            />

            <div className="absolute inset-0 z-[2]">
              <SectionMediaFill media={media} alt={banner.title} fit="cover" priority={index === 0} />
            </div>

            <div
              className={`absolute inset-0 z-[3] ${
                alignRight
                  ? 'bg-gradient-to-l from-black/80 via-black/45 to-black/20'
                  : 'bg-gradient-to-r from-black/80 via-black/55 to-black/30'
              }`}
            />
            <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/50 via-transparent to-black/30" />

            <div className="absolute inset-0 z-[4] flex items-center">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  initial={{ opacity: 0, x: alignRight ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className={`max-w-lg ${
                    alignRight ? 'mx-auto sm:ml-auto text-center sm:text-right' : ''
                  }`}
                >
                  {!alignRight ? (
                    <>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                        className="inline-block text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3"
                      >
                        {banner.subtitle}
                      </motion.span>
                      <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
                        className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-wider uppercase text-white/90 mb-4"
                      >
                        {banner.title}
                      </motion.h2>
                    </>
                  ) : (
                    <>
                      <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                        className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wider uppercase text-white mb-3"
                      >
                        {banner.title}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                        className="text-sm sm:text-base text-white/70 leading-relaxed mb-7 max-w-sm mx-auto sm:ml-auto"
                      >
                        {banner.subtitle}
                      </motion.p>
                    </>
                  )}

                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                    className={`w-14 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mb-6 origin-left rounded-full ${
                      alignRight ? 'mx-auto sm:ml-auto origin-center sm:origin-right bg-gradient-to-l' : ''
                    }`}
                  />

                  <motion.button
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
                    onClick={() => goToShop({ category: banner.linkCategory })}
                    className={
                      alignRight
                        ? 'group inline-flex items-center justify-center gap-2.5 border-2 border-white/80 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold tracking-wider uppercase hover:bg-white hover:text-slate-900 transition-all duration-300 backdrop-blur-sm active:scale-[0.98]'
                        : 'group inline-flex items-center justify-center gap-2.5 bg-amber-500 text-slate-900 px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold tracking-wider uppercase hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-black/30 hover:shadow-xl active:scale-[0.98]'
                    }
                  >
                    {banner.ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
