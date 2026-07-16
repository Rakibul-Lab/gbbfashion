'use client'

import { motion } from 'framer-motion'
import type { CategoryPageConfig } from '@/lib/categories'
import type { SectionMediaSlot } from '@/lib/section-media'
import { SectionMediaFill } from '@/components/section-media'

interface CategoryHeroProps {
  config: CategoryPageConfig
  leftMedia?: SectionMediaSlot
  rightMedia?: SectionMediaSlot
}

function HeroProductMedia({
  media,
  alt,
  className,
  delay = 0,
}: {
  media?: SectionMediaSlot
  alt: string
  className?: string
  delay?: number
}) {
  if (!media?.url) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative ${className ?? ''}`}
    >
      <SectionMediaFill media={media} alt={alt} fit="fill" priority={delay === 0} />
    </motion.div>
  )
}

export function CategoryHero({ config, leftMedia, rightMedia }: CategoryHeroProps) {
  const centerMedia = leftMedia?.url ? leftMedia : rightMedia

  return (
    <section className="relative w-full overflow-hidden bg-[#E8DCC8]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute -left-[10%] top-[10%] w-[55%] h-[80%] opacity-30"
          viewBox="0 0 400 300"
          fill="none"
          aria-hidden
        >
          <path
            d="M0 150C80 80 160 220 240 150C320 80 360 180 400 120V300H0V150Z"
            fill="#C4A882"
          />
        </svg>
        <svg
          className="absolute -right-[5%] bottom-0 w-[50%] h-[70%] opacity-25"
          viewBox="0 0 400 300"
          fill="none"
          aria-hidden
        >
          <path
            d="M400 180C320 100 240 240 160 160C80 80 40 200 0 140V300H400V180Z"
            fill="#B8956A"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-[#EDE4D3]/40 via-transparent to-[#D9C9AD]/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center min-h-[260px] sm:min-h-[320px] md:min-h-[380px] py-10 md:py-14">
          <HeroProductMedia
            media={leftMedia}
            alt=""
            delay={0.15}
            className="hidden md:block absolute left-0 lg:left-4 bottom-6 w-[140px] lg:w-[180px] xl:w-[220px] aspect-square"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center px-4 max-w-2xl"
          >
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#3D2B1F] leading-none ${
                config.accentClass ?? ''
              }`}
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {config.title}
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold tracking-[0.25em] uppercase text-[#5C4033]/90">
              {config.subtitle}
            </p>
            {config.description && (
              <p className="mt-3 text-sm text-[#5C4033]/70 max-w-md mx-auto hidden sm:block">
                {config.description}
              </p>
            )}

            <HeroProductMedia
              media={centerMedia}
              alt=""
              delay={0.3}
              className="mx-auto mt-6 w-[72px] sm:w-[88px] md:w-[100px] aspect-square md:hidden"
            />
            <HeroProductMedia
              media={centerMedia}
              alt=""
              delay={0.35}
              className="hidden md:block mx-auto mt-8 w-[90px] lg:w-[110px] aspect-square"
            />
          </motion.div>

          <HeroProductMedia
            media={rightMedia}
            alt=""
            delay={0.2}
            className="hidden md:block absolute right-0 lg:right-4 bottom-8 w-[150px] lg:w-[190px] xl:w-[230px] aspect-[4/5]"
          />
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-transparent via-[#C4A882]/40 to-transparent" />
    </section>
  )
}
