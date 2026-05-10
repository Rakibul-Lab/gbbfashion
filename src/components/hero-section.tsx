'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  const { setView, setCategoryFilter } = useStore()

  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-width hero banner */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[85vh] min-h-[400px]">
        <img
          src="/hero-mothers-day.jpg"
          alt="Baand GBB - Mother's Day Special Collection"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white/80 mb-3 sm:mb-4">
                  Mother&apos;s Day Special
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6"
                style={{ fontFamily: 'Jost, sans-serif' }}
              >
                Celebrate Her
                <br />
                <span className="text-amber-300">With Elegance</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 max-w-md leading-relaxed"
              >
                Discover our exclusive collection of premium leather bags, shoes, and accessories crafted with love. The perfect gift for the extraordinary woman in your life.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => {
                    setCategoryFilter('women')
                    setView('shop')
                  }}
                  className="group inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-7 py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-amber-300 transition-colors duration-300"
                >
                  Shop Women
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('all')
                    setView('shop')
                  }}
                  className="group inline-flex items-center justify-center gap-2 border-2 border-white text-white px-7 py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-white hover:text-slate-900 transition-colors duration-300"
                >
                  Shop All
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Promo strip below hero */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="py-4 sm:py-5 text-center">
              <p className="text-xs sm:text-sm tracking-wider uppercase text-white/60">Free Shipping</p>
              <p className="text-sm sm:text-base font-semibold mt-0.5">On Orders Over $99</p>
            </div>
            <div className="py-4 sm:py-5 text-center">
              <p className="text-xs sm:text-sm tracking-wider uppercase text-white/60">Mother&apos;s Day Sale</p>
              <p className="text-sm sm:text-base font-semibold mt-0.5">Up To 30% Off</p>
            </div>
            <div className="py-4 sm:py-5 text-center">
              <p className="text-xs sm:text-sm tracking-wider uppercase text-white/60">Easy Returns</p>
              <p className="text-sm sm:text-base font-semibold mt-0.5">7-Day Return Policy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
