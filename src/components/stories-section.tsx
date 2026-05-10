'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const stories = [
  {
    id: 'story-women',
    image: '/story-model-1.png',
    tagline: 'Timeless. Bold. Unstoppable.',
    subtext: 'Discover the collection that defines her confidence',
    categoryFilter: 'women',
    label: 'Women',
  },
  {
    id: 'story-men',
    image: '/story-model-2.png',
    tagline: 'Crafted for the Modern Man',
    subtext: 'Where craftsmanship meets contemporary style',
    categoryFilter: 'men',
    label: 'Men',
  },
]

export function StoriesSection() {
  const { setView, setCategoryFilter } = useStore()

  const handleClick = (categoryFilter: string) => {
    setCategoryFilter(categoryFilter)
    setView('shop')
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-slate-900">
            STORIES THAT LEAD
          </h2>
          <div className="mt-4 mx-auto w-16 h-0.5 bg-amber-500" />
          <p className="mt-4 text-slate-500 text-sm sm:text-base max-w-lg mx-auto tracking-wide">
            More than fashion — a statement of identity. Discover the narratives behind our collections.
          </p>
        </motion.div>

        {/* Story Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                delay: index * 0.15,
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group cursor-pointer"
              onClick={() => handleClick(story.categoryFilter)}
            >
              <div className="relative aspect-[3/4] sm:aspect-[3/4] overflow-hidden bg-slate-200 rounded-sm">
                {/* Image */}
                <img
                  src={story.image}
                  alt={story.tagline}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Content overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
                  {/* Category label */}
                  <motion.span
                    className="inline-block text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-amber-300 mb-2 sm:mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
                  >
                    {story.label}
                  </motion.span>

                  {/* Tagline */}
                  <h3 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold tracking-wide leading-tight mb-1.5 sm:mb-2 transition-transform duration-500 group-hover:-translate-y-2">
                    {story.tagline}
                  </h3>

                  {/* Subtext */}
                  <p className="text-white/60 text-xs sm:text-sm tracking-wide mb-3 sm:mb-4 transition-all duration-500 group-hover:translate-y-0 translate-y-2 group-hover:opacity-100 opacity-0">
                    {story.subtext}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-all duration-500 group-hover:translate-y-0 translate-y-4 opacity-0 group-hover:opacity-100">
                    <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase">
                      Shop Now
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hover border accent */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/40 transition-colors duration-500 rounded-sm" />

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-600 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
