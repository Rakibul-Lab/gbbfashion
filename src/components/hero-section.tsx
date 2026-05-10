'use client'

import { motion } from 'framer-motion'
import { Truck, RotateCcw, Banknote } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero banner — full-screen image, no text, no buttons */}
      <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-screen min-h-[500px]">
        {/* Background image */}
        <img
          src="/hero-banner.jpg"
          alt="GBB Fashion — Mother's Day Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Promo strip */}
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
                <p className="text-xs sm:text-sm font-semibold mt-0.5">On Orders Over ৳1,999</p>
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
