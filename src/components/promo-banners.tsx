'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function PromoBanners() {
  const { setView, setCategoryFilter } = useStore()

  return (
    <section className="w-full">
      {/* Prime Drop Banner */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] min-h-[400px] overflow-hidden">
        {/* Fallback dark gradient background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(135deg, #0a0a0a 0%, #111827 40%, #1e1b4b 100%)',
          }}
        />

        {/* Background image */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            backgroundImage: 'url(/banner-prime-drop.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Dark overlay for text readability — heavier on edges */}
        <div className="absolute inset-0 z-[3] bg-black/50" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/50 via-transparent to-black/40" />

        {/* Content — centered */}
        <div className="absolute inset-0 z-[4] flex items-center justify-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center text-center"
            >
              {/* Top label */}
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                className="block text-[11px] sm:text-xs font-semibold tracking-[0.3em] sm:tracking-[0.35em] uppercase text-white/60 mb-4 sm:mb-5"
              >
                PATCHEE TOP PICKS
              </motion.span>

              {/* Main heading — serif style */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-light tracking-wide text-white mb-3 sm:mb-4"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                THE PRIME DROP
              </motion.h2>

              {/* Discount text */}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
                className="block text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-wider mb-6 sm:mb-8"
              >
                UPTO 50% OFF
              </motion.span>

              {/* CTA Button — black bg, white text */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                onClick={() => {
                  setCategoryFilter('all')
                  setView('shop')
                }}
                className="group inline-flex items-center justify-center gap-2.5 bg-black text-white px-8 sm:px-10 py-3.5 sm:py-4 text-sm font-semibold tracking-wider uppercase hover:bg-white hover:text-black transition-all duration-300 border border-white/20 active:scale-[0.97]"
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
