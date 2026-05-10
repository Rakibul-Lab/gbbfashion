'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function LuxeLeatherBags() {
  const { setView, setCategoryFilter } = useStore()

  return (
    <section className="relative w-full bg-black overflow-hidden">
      {/* Subtle warm amber vignette / glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(217, 161, 67, 0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(217, 161, 67, 0.05) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 min-h-[70vh] md:min-h-[80vh] flex flex-col md:flex-row">
        {/* Left side — Text content (vertically centered) */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 sm:py-16 md:px-12 lg:px-20 md:py-0 order-2 md:order-1">
          <div className="max-w-lg">
            {/* Main heading — Luxe Leather */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light tracking-wide text-white leading-[1.05]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <span className="italic">Luxe Leather</span>
            </motion.h2>

            {/* Bags — amber accent */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-wide text-amber-400 leading-[1.05] mt-1"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Bags
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="text-sm sm:text-base tracking-[0.25em] uppercase text-white/70 mt-6 font-medium"
            >
              Premium. Bold. Yours.
            </motion.p>

            {/* Decorative amber line separator */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
              className="w-20 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 mt-6 origin-left"
            />

            {/* Description paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
              className="text-white/60 text-sm sm:text-base leading-relaxed mt-6 max-w-md"
            >
              Discover our curated collection of premium leather bags — where timeless
              craftsmanship meets modern elegance. Each piece is designed to elevate your
              everyday, crafted from the finest materials for those who refuse to
              compromise.
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
              onClick={() => {
                setCategoryFilter('Bags')
                setView('shop')
              }}
              className="group inline-flex items-center justify-center gap-2.5 border border-white text-white px-8 sm:px-10 py-3.5 sm:py-4 text-sm font-semibold tracking-wider uppercase mt-8 hover:bg-white hover:text-black transition-all duration-300 active:scale-[0.97]"
            >
              Explore Collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>

        {/* Right side — Image */}
        <div className="flex-1 md:flex-[1.2] relative order-1 md:order-2">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="relative w-full h-[50vh] md:h-full min-h-[350px] md:min-h-[70vh]"
          >
            {/* Image */}
            <img
              src="/luxe-leather-bags.jpg"
              alt="Woman holding a premium brown leather bag from the Luxe Leather collection"
              className="w-full h-full object-cover object-center"
            />

            {/* Warm amber vignette on image */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to left, transparent 50%, rgba(0,0,0,0.5) 100%), linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%), radial-gradient(ellipse at bottom right, rgba(217,161,67,0.1) 0%, transparent 60%)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
