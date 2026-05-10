'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'

const categories = [
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
    id: 'accessories',
    label: 'Accessories',
    image: '/categories/accessories.png',
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
]

export function CategoryCards() {
  const { setView, setCategoryFilter } = useStore()

  const handleCategoryClick = (categoryId: string) => {
    setCategoryFilter(categoryId)
    setView('shop')
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Shop by Category</h2>
          <p className="mt-2 text-sm text-slate-500">Explore our curated collections</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="group cursor-pointer"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {/* Overlay with category name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs sm:text-sm font-semibold text-center drop-shadow-lg">
                    {cat.label}
                  </p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/10 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
