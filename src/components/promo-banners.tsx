'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function PromoBanners() {
  const { setView, setCategoryFilter } = useStore()

  return (
    <section className="w-full">
      {/* Banner 1: THE PRIME DROP */}
      <div className="relative w-full h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[340px] overflow-hidden">
        {/* Parallax-like fixed background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/banner-prime-drop.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Fallback gradient */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(135deg, #1c1917 0%, #292524 40%, #57534e 100%)',
          }}
        />

        {/* Re-apply image above fallback so it shows when loaded */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            backgroundImage: 'url(/banner-prime-drop.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Content — left aligned */}
        <div className="absolute inset-0 z-[4] flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-lg"
            >
              {/* Large discount text */}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className="inline-block text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-none mb-3"
              >
                UPTO{' '}
                <span className="text-amber-400">50%</span>
                <br />
                OFF
              </motion.span>

              {/* Subtitle */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider uppercase text-white/90 mb-4"
              >
                The Prime Drop
              </motion.h2>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                className="w-14 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mb-6 origin-left rounded-full"
              />

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
                onClick={() => {
                  setCategoryFilter('all')
                  setView('shop')
                }}
                className="group inline-flex items-center justify-center gap-2.5 bg-amber-500 text-slate-900 px-8 py-4 text-sm font-bold tracking-wider uppercase hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-black/30 hover:shadow-xl active:scale-[0.98]"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Banner 2: LUXE LEATHER */}
      <div className="relative w-full h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[340px] overflow-hidden">
        {/* Fallback gradient */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(135deg, #44403c 0%, #57534e 40%, #78716c 100%)',
          }}
        />

        {/* Parallax-like fixed background */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            backgroundImage: 'url(/banner-luxe-leather.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Elegant overlay for text readability */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-l from-black/80 via-black/45 to-black/20" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/40 via-transparent to-black/30" />

        {/* Content — right aligned */}
        <div className="absolute inset-0 z-[4] flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-lg ml-auto text-right"
            >
              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wider uppercase text-white mb-3"
              >
                Luxe Leather
                <br />
                <span className="text-amber-400">Bags</span>
              </motion.h2>

              {/* Decorative line — right aligned */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
                className="w-14 h-1 bg-gradient-to-l from-amber-400 to-amber-600 mb-5 ml-auto origin-right rounded-full"
              />

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="text-sm sm:text-base text-white/70 leading-relaxed mb-7 max-w-sm ml-auto"
              >
                Exquisite craftsmanship meets contemporary design. Explore our
                curated collection of premium leather bags, handcrafted for the
                discerning individual.
              </motion.p>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
                onClick={() => {
                  setCategoryFilter('women')
                  setView('shop')
                }}
                className="group inline-flex items-center justify-center gap-2.5 border-2 border-white/80 text-white px-8 py-4 text-sm font-bold tracking-wider uppercase hover:bg-white hover:text-slate-900 transition-all duration-300 backdrop-blur-sm active:scale-[0.98]"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
