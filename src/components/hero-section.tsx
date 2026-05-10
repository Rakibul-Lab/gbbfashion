'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, Heart, RotateCcw } from 'lucide-react'

export function HeroSection() {
  const { setView, setCategoryFilter } = useStore()

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero banner with guaranteed visible gradient background */}
      <div className="relative w-full h-[60vh] sm:h-[75vh] lg:h-[90vh] min-h-[420px]">
        {/* LAYER 1 (z-0): Solid gradient background — ALWAYS visible even without image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #292524 60%, #78350f 100%)',
          }}
        />

        {/* LAYER 2 (z-[1]): Background image overlay — enhances but not required */}
        <img
          src="/hero-mothers-day.jpg"
          alt="Mother's Day Special Collection"
          className="absolute inset-0 z-[1] w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          onError={(e) => {
            // Hide image entirely if it fails to load
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        {/* LAYER 3 (z-[2]): Dark gradient overlays for text readability */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        {/* Warm amber vignette on the left */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(120,53,15,0.25) 0%, transparent 70%)',
          }}
        />

        {/* LAYER 4 (z-[3]): Text content — always on top */}
        <div className="absolute inset-0 z-[3] flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl lg:max-w-2xl">
              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase mb-4 sm:mb-5 text-amber-400">
                  <span className="inline-block w-8 h-px bg-amber-400/70" />
                  Mother&apos;s Day Special
                  <span className="inline-block w-8 h-px bg-amber-400/70" />
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] mb-5 sm:mb-7 text-white"
              >
                Celebrate Her
                <br />
                <span className="text-amber-300">With Elegance</span>
              </motion.h1>

              {/* Decorative divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 mb-5 sm:mb-7 origin-left"
              />

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
                className="text-sm sm:text-base lg:text-lg mb-7 sm:mb-9 max-w-md lg:max-w-lg leading-relaxed text-white/80"
              >
                Discover our exclusive collection of premium leather bags, shoes, and accessories crafted with love. The perfect gift for the extraordinary woman in your life.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <button
                  onClick={() => {
                    setCategoryFilter('women')
                    setView('shop')
                  }}
                  className="group inline-flex items-center justify-center gap-2.5 bg-white text-slate-900 px-8 py-4 text-sm font-semibold tracking-wider uppercase hover:bg-amber-300 transition-all duration-300 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-amber-900/20"
                >
                  Shop Women
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('all')
                    setView('shop')
                  }}
                  className="group inline-flex items-center justify-center gap-2.5 border-2 border-white/80 text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase hover:bg-white hover:text-slate-900 transition-all duration-300 backdrop-blur-sm"
                >
                  Shop All
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
            <div className="py-4 sm:py-5 text-center flex items-center justify-center gap-2.5">
              <Truck className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs tracking-wider uppercase text-white/50">Free Shipping</p>
                <p className="text-sm font-semibold mt-0.5">On Orders Over $99</p>
              </div>
            </div>
            <div className="py-4 sm:py-5 text-center flex items-center justify-center gap-2.5">
              <Heart className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs tracking-wider uppercase text-white/50">Mother&apos;s Day Sale</p>
                <p className="text-sm font-semibold mt-0.5">Up To 30% Off</p>
              </div>
            </div>
            <div className="py-4 sm:py-5 text-center flex items-center justify-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs tracking-wider uppercase text-white/50">Easy Returns</p>
                <p className="text-sm font-semibold mt-0.5">7-Day Return Policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
