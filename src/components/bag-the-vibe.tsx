'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { useCurrency } from '@/hooks/use-currency'
import { useSectionMedia } from '@/hooks/use-section-media'
import { SectionMediaFill } from '@/components/section-media'
import { productImageContainerClass } from '@/lib/product-image'
import { ArrowRight } from 'lucide-react'

export function BagTheVibe() {
  const { setView, selectProduct } = useStore()
  const { format } = useCurrency()
  const { get } = useSectionMedia()

  const handleViewProduct = () => {
    selectProduct('butterfly-design-shoulder-bag')
    setView('product')
  }

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-widest uppercase text-slate-900">
            BAG THE VIBE
          </h2>
          <div className="mt-4 mx-auto w-16 h-0.5 bg-slate-900" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="relative aspect-[3/4] overflow-hidden rounded-sm group cursor-pointer"
          >
            <SectionMediaFill
              media={get('bag_the_vibe')}
              alt="Woman with a stylish handbag — lifestyle"
              fit="cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-white/90 text-sm md:text-base tracking-wider uppercase font-medium">
                Style that speaks before you do
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="flex flex-col items-center justify-center bg-slate-50 rounded-sm p-6 md:p-10 group"
          >
            <span className="inline-block bg-black text-white text-[10px] md:text-xs font-bold tracking-widest uppercase px-4 py-1.5 mb-6">
              TRENDING
            </span>

            <div
              className={`relative w-full max-w-[200px] sm:max-w-[220px] mx-auto ${productImageContainerClass} mb-6`}
            >
              <SectionMediaFill
                media={get('bag_the_vibe_product')}
                alt="Butterfly Design Shoulder Bag"
                fit="fill"
              />
            </div>

            <h3 className="text-base md:text-lg font-semibold text-slate-900 text-center mb-2">
              Butterfly Design Shoulder Bag
            </h3>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl md:text-2xl font-bold text-slate-900">
                {format(1025)}
              </span>
              <span className="text-sm md:text-base text-slate-400 line-through">
                {format(2562)}
              </span>
            </div>

            <button
              onClick={handleViewProduct}
              className="group/btn flex items-center gap-2 bg-black text-white text-xs md:text-sm font-semibold tracking-widest uppercase px-8 py-3.5 transition-all duration-300 hover:bg-slate-800 hover:gap-3"
            >
              VIEW PRODUCT
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
