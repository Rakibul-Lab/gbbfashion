'use client'

import { useShopNavigation } from '@/hooks/use-shop-navigation'
import { useSectionMedia } from '@/hooks/use-section-media'
import { SectionMediaFill } from '@/components/section-media'
import { motion } from 'framer-motion'

const collections = [
  {
    title: 'Backpack Series',
    mediaKey: 'backpack_series_0',
    category: 'men',
    subCategory: 'bag-pack',
  },
  {
    title: 'Shoulder Bags',
    mediaKey: 'backpack_series_1',
    category: 'women',
    subCategory: 'shoulder-bag',
  },
  {
    title: 'Handbags',
    mediaKey: 'backpack_series_2',
    category: 'women',
    subCategory: 'hand-bag',
  },
]

export function BackpackSeries() {
  const { goToShop } = useShopNavigation()
  const { get } = useSectionMedia()

  const handleClick = (category: string, subCategory?: string) => {
    goToShop({ category, subCategory })
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="group cursor-pointer sm:row-span-2"
            onClick={() => handleClick(collections[0].category, collections[0].subCategory)}
          >
            <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[400px] lg:min-h-[520px] overflow-hidden bg-slate-100 rounded-sm">
              <SectionMediaFill
                media={get(collections[0].mediaKey)}
                alt={collections[0].title}
                fit="fill"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80 group-hover:via-black/30" />
              <div className="absolute inset-0 flex items-end p-5 sm:p-6 lg:p-8">
                <h3 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-widest uppercase drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  {collections[0].title}
                </h3>
              </div>
            </div>
          </motion.div>

          {[collections[1], collections[2]].map((item, i) => (
            <motion.div
              key={item.mediaKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2 + i * 0.1,
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group cursor-pointer"
              onClick={() => handleClick(item.category, item.subCategory)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 rounded-sm">
                <SectionMediaFill media={get(item.mediaKey)} alt={item.title} fit="fill" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80 group-hover:via-black/30" />
                <div className="absolute inset-0 flex items-end p-5 sm:p-6 lg:p-8">
                  <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold tracking-widest uppercase drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                    {item.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
