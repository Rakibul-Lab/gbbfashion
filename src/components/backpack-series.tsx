'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'

const collections = [
  {
    title: 'Backpack Series',
    image: '/backpack-series.jpg',
    categoryFilter: 'women',
    size: 'large' as const,
  },
  {
    title: 'Shoulder Bags',
    image: '/shoulder-bags-collection.jpg',
    categoryFilter: 'women',
    size: 'small' as const,
  },
  {
    title: 'Handbags',
    image: '/handbags-collection.jpg',
    categoryFilter: 'women',
    size: 'small' as const,
  },
]

export function BackpackSeries() {
  const { setView, setCategoryFilter } = useStore()

  const handleClick = (categoryFilter: string) => {
    setCategoryFilter(categoryFilter)
    setView('shop')
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest text-slate-900 uppercase">
            TIMELESS. BOLD. UNSTOPPABLE.
          </h2>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          {/* Left Column - Large Backpack Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group cursor-pointer sm:row-span-2"
            onClick={() => handleClick(collections[0].categoryFilter)}
          >
            <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[400px] lg:min-h-[520px] overflow-hidden bg-slate-100 rounded-sm">
              {/* Image */}
              <img
                src={collections[0].image}
                alt={collections[0].title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Dark gradient overlay from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80 group-hover:via-black/30" />
              {/* Text overlay at bottom */}
              <div className="absolute inset-0 flex items-end p-5 sm:p-6 lg:p-8">
                <h3 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-widest uppercase drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  {collections[0].title}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Shoulder Bags (Top) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group cursor-pointer"
            onClick={() => handleClick(collections[1].categoryFilter)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 rounded-sm">
              {/* Image */}
              <img
                src={collections[1].image}
                alt={collections[1].title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Dark gradient overlay from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80 group-hover:via-black/30" />
              {/* Text overlay at bottom */}
              <div className="absolute inset-0 flex items-end p-5 sm:p-6 lg:p-8">
                <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold tracking-widest uppercase drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  {collections[1].title}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Handbags (Bottom) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group cursor-pointer"
            onClick={() => handleClick(collections[2].categoryFilter)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 rounded-sm">
              {/* Image */}
              <img
                src={collections[2].image}
                alt={collections[2].title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Dark gradient overlay from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80 group-hover:via-black/30" />
              {/* Text overlay at bottom */}
              <div className="absolute inset-0 flex items-end p-5 sm:p-6 lg:p-8">
                <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold tracking-widest uppercase drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  {collections[2].title}
                </h3>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
