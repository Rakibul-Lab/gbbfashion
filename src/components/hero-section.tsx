'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, RotateCcw, Banknote } from 'lucide-react'

export function HeroSection() {
  const { setView, setCategoryFilter } = useStore()

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero banner */}
      <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-screen min-h-[500px]">
        {/* LAYER 1: Gradient fallback */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(135deg, #1c1917 0%, #292524 25%, #44403c 50%, #57534e 75%, #78716c 100%)',
          }}
        />

        {/* LAYER 2: Background image */}
        <img
          src="/hero-fashion.png"
          alt="GBB Fashion — Premium Collection"
          className="absolute inset-0 z-[1] w-full h-full object-cover object-center"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        {/* LAYER 3: Gradient overlays */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        {/* Warm amber vignette */}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              'radial-gradient(ellipse at 20% 60%, rgba(180,83,9,0.15) 0%, transparent 60%)',
          }}
        />

        {/* LAYER 4: Text content */}
        <div className="absolute inset-0 z-[3] flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl lg:max-w-2xl">
              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mb-4 sm:mb-6"
              >
                <span className="inline-flex items-center gap-3 text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-amber-400/90">
                  <span className="inline-block w-10 sm:w-14 h-px bg-amber-400/60" />
                  Timeless Elegance
                  <span className="inline-block w-10 sm:w-14 h-px bg-amber-400/60" />
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-4 sm:mb-6 text-white tracking-tight"
              >
                Redefine
                <br />
                Your{' '}
                <span className="text-amber-400 italic font-extrabold">Style</span>
              </motion.h1>

              {/* Decorative accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
                className="flex items-center gap-3 mb-5 sm:mb-7 origin-left"
              >
                <div className="w-20 sm:w-28 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                <span className="text-amber-300/70 text-xs sm:text-sm font-medium tracking-wider">
                  Starting from ৳765
                </span>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                className="text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 max-w-md lg:max-w-lg leading-relaxed text-white/70"
              >
                Discover handcrafted leather bags, premium shoes, and accessories
                designed for the modern Bangladeshi wardrobe.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <button
                  onClick={() => {
                    setCategoryFilter('women')
                    setView('shop')
                  }}
                  className="group inline-flex items-center justify-center gap-2.5 bg-amber-500 text-slate-900 px-8 py-4 text-sm font-bold tracking-wider uppercase hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-black/30 hover:shadow-xl active:scale-[0.98]"
                >
                  Shop Women
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('all')
                    setView('shop')
                  }}
                  className="group inline-flex items-center justify-center gap-2.5 border-2 border-white/70 text-white px-8 py-4 text-sm font-bold tracking-wider uppercase hover:bg-white hover:text-slate-900 transition-all duration-300 backdrop-blur-sm active:scale-[0.98]"
                >
                  Shop All
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </div>

      {/* Promo strip */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="py-4 sm:py-5 text-center flex items-center justify-center gap-3"
            >
              <Truck className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] tracking-wider uppercase text-white/40">Free Shipping</p>
                <p className="text-xs sm:text-sm font-semibold mt-0.5">On Orders Over ৳1,999</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
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
              transition={{ duration: 0.5, delay: 1.0 }}
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
