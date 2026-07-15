'use client'

import { useStore } from '@/lib/store'
import { useSectionMedia } from '@/hooks/use-section-media'
import { SectionMediaFill } from '@/components/section-media'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function OwnItLeadIt() {
  const { setView } = useStore()
  const { get } = useSectionMedia()

  return (
    <section className="w-full bg-[#FAFAF8] py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full md:w-[58%] flex-shrink-0"
          >
            <div className="relative overflow-hidden rounded-sm aspect-[4/3]">
              <SectionMediaFill
                media={get('own_it_lead_it')}
                alt="Woman with handbags — Own It, Lead It"
                fit="fill"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Column — Text Content */}
          <div className="w-full md:w-[42%] flex flex-col items-start justify-center text-left">
            {/* Heading: OWN IT. */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]"
            >
              OWN IT.
            </motion.h2>

            {/* Heading: LEAD IT. with accent color */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mt-1 sm:mt-2"
              style={{ color: '#b8860b' }}
            >
              LEAD IT.
            </motion.h2>

            {/* Decorative separator line */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="mt-6 sm:mt-8 h-[2px] w-16 origin-left"
              style={{ backgroundColor: '#b8860b' }}
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="mt-6 sm:mt-8 text-sm sm:text-base leading-relaxed text-slate-600 max-w-md"
            >
              At Baand GBB, we believe every bag tells a story. From handcrafted
              leather totes to statement shoulder bags, each piece is designed to
              empower your journey. Discover collections that blend timeless
              elegance with modern boldness.
            </motion.p>

            {/* OUR STORY Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                delay: 0.55,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              onClick={() => setView('shop')}
              className="group mt-8 sm:mt-10 inline-flex items-center justify-center gap-2.5 bg-slate-900 text-white px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase hover:bg-slate-700 transition-all duration-300 active:scale-[0.97]"
            >
              OUR STORY
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
