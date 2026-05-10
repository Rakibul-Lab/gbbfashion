'use client'

import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ReelProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  thumbnail: string
  videoThumbnail: string
  videoSrc: string
}

const reelProducts: ReelProduct[] = [
  {
    id: 'reel-butterfly-bag',
    name: 'Butterfly Shoulder Bag',
    price: 1645,
    originalPrice: 2499,
    thumbnail: '/products/featured/butterfly-bag.png',
    videoThumbnail: '/reels/thumb-1.png',
    videoSrc: '/reels/video-1.mp4',
  },
  {
    id: 'reel-crossbody-bag',
    name: 'Premium Crossbody Bag',
    price: 1299,
    originalPrice: 1899,
    thumbnail: '/products/featured/crossbody-bag.png',
    videoThumbnail: '/reels/thumb-2.png',
    videoSrc: '/reels/video-2.mp4',
  },
  {
    id: 'reel-british-loafers',
    name: 'British Style Loafers',
    price: 1899,
    originalPrice: 2799,
    thumbnail: '/products/featured/british-loafers.png',
    videoThumbnail: '/reels/thumb-3.png',
    videoSrc: '/reels/video-3.mp4',
  },
  {
    id: 'reel-duffle-bag',
    name: 'Luxury Duffle Bag',
    price: 2199,
    originalPrice: 3299,
    thumbnail: '/products/featured/duffle-bag.png',
    videoThumbnail: '/reels/thumb-4.png',
    videoSrc: '/reels/video-4.mp4',
  },
  {
    id: 'reel-shoulder-bag',
    name: 'Chic Shoulder Bag',
    price: 1499,
    originalPrice: 2199,
    thumbnail: '/products/featured/shoulder-bag.png',
    videoThumbnail: '/reels/thumb-5.png',
    videoSrc: '/reels/video-5.mp4',
  },
]

function ReelCard({ product, index }: { product: ReelProduct; index: number }) {
  const { addToCart, selectProduct, setView } = useStore()
  const [showOverlay, setShowOverlay] = useState(false)
  const [isInViewport, setIsInViewport] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver: auto-play when visible, pause when off-screen
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  // Play/pause based on viewport visibility
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isInViewport) {
      video.play().catch(() => {
        // Autoplay blocked, will show poster
      })
    } else {
      video.pause()
    }
  }, [isInViewport])

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail,
    })
    setShowOverlay(true)
    setTimeout(() => setShowOverlay(false), 1500)
  }, [addToCart, product])

  const handleProductClick = useCallback(() => {
    selectProduct(product.id)
    setView('product')
  }, [selectProduct, setView, product.id])

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] group"
    >
      {/* Video Card — autoplay, muted, looping, no controls */}
      <div
        ref={cardRef}
        className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-900"
      >
        {/* Video element — autoplay, muted, continuous loop */}
        <video
          ref={videoRef}
          src={product.videoSrc}
          poster={product.videoThumbnail}
          muted
          loop
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Sale badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              -{discount}%
            </span>
          </div>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 pointer-events-none">
          {/* Product thumbnail + name row */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-white/20 pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                handleProductClick()
              }}
            >
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-sm font-medium leading-tight truncate">
                {product.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-white font-bold text-sm">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-white/50 text-[10px] line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Add To Cart button */}
          <button
            onClick={handleAddToCart}
            className="pointer-events-auto w-full bg-black hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add To Cart
          </button>
        </div>

        {/* Added to cart overlay */}
        <AnimatePresence>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-lg px-4 py-3 flex items-center gap-2 shadow-xl"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-900">Added!</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll])

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, [])

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.15em] text-slate-900">
            STORIES THAT LEAD
          </h2>
          <div className="mt-3 mx-auto w-12 h-0.5 bg-amber-500" />
          <p className="mt-3 text-slate-500 text-xs sm:text-sm max-w-md mx-auto tracking-wide">
            Watch our latest reels and shop the look instantly
          </p>
        </motion.div>

        {/* Reels Carousel */}
        <div className="relative">
          {/* Scroll Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Scrollable Reels Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 px-1 snap-x snap-mandatory"
          >
            {reelProducts.map((product, index) => (
              <div key={product.id} className="snap-start">
                <ReelCard product={product} index={index} />
              </div>
            ))}
          </div>

          {/* Scroll Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Fade edges */}
          <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-[5]" />
          <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-[5]" />
        </div>
      </div>
    </section>
  )
}
