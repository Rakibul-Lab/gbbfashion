'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    image: '/categories/diagnostics.jpg',
  },
  {
    id: 'predictive',
    label: 'Predictive',
    image: '/categories/predictive.jpg',
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    image: '/categories/monitoring.jpg',
  },
  {
    id: 'robotic',
    label: 'Robotic',
    image: '/categories/robotic.jpg',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    image: '/categories/analytics.jpg',
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              {/* Category label below image */}
              <p className="text-center text-sm font-semibold text-slate-700 mt-2.5 group-hover:text-teal-600 transition-colors">
                {cat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
