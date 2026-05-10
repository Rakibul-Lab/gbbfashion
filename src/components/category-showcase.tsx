'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const shopCategories = [
  {
    id: 'women',
    label: "Women's Bags",
    image: '/categories/women-bags.png',
  },
  {
    id: 'men',
    label: "Men's Bags",
    image: '/categories/men-bags.png',
  },
  {
    id: 'shoes',
    label: 'Shoes',
    image: '/categories/shoes.png',
  },
  {
    id: 'belt',
    label: 'Belt',
    image: '/categories/belt.png',
  },
  {
    id: 'kids',
    label: 'Kids',
    image: '/categories/kids.png',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    image: '/categories/accessories.png',
  },
]

const featuredCollections = [
  {
    title: 'BACKPACK SERIES',
    subtitle: 'Carry your world in style',
    image: '/categories/women-bags.png',
    categoryFilter: 'women',
  },
  {
    title: 'SHOULDER BAGS',
    subtitle: 'Elegance on your shoulder',
    image: '/categories/shoes.png',
    categoryFilter: 'shoes',
  },
  {
    title: 'HANDBAGS',
    subtitle: 'The art of refined carry',
    image: '/categories/belt.png',
    categoryFilter: 'belt',
  },
]

export function CategoryShowcase() {
  const { setView, setCategoryFilter } = useStore()

  const handleCategoryClick = (categoryId: string) => {
    setCategoryFilter(categoryId)
    setView('shop')
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Row 1: SHOP BY CATEGORY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest text-slate-900">
            SHOP BY CATEGORY
          </h2>
          <div className="mt-3 mx-auto w-16 h-0.5 bg-amber-500" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-14 sm:mb-16 lg:mb-20">
          {shopCategories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group cursor-pointer"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 rounded-sm">
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Category name centered */}
                <div className="absolute inset-0 flex items-end justify-center pb-5">
                  <span className="text-white text-base sm:text-lg font-semibold tracking-widest uppercase drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                    {cat.label}
                  </span>
                </div>
                {/* Hover accent border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/60 transition-colors duration-300 rounded-sm" />
                {/* Arrow indicator on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Row 2: Featured Collection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {featuredCollections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group cursor-pointer"
              onClick={() => handleCategoryClick(collection.categoryFilter)}
            >
              <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-slate-100 rounded-sm">
                {/* Background image */}
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 px-4">
                  <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-bold tracking-widest uppercase mb-1">
                    {collection.title}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm tracking-wide mb-4 text-center">
                    {collection.subtitle}
                  </p>
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold tracking-widest uppercase border border-white/80 text-white hover:bg-white hover:text-slate-900 transition-all duration-300 rounded-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryClick(collection.categoryFilter)
                    }}
                  >
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
                {/* Hover accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
