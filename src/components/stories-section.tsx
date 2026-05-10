'use client'

import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ShoppingBag, Volume2, VolumeX, X } from 'lucide-react'
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
    videoThumbnail: '/reels/reel-1.png',
    videoSrc: '/reels/dummy-video.mp4',
  },
  {
    id: 'reel-crossbody-bag',
    name: 'Premium Crossbody Bag',
    price: 1299,
    originalPrice: 1899,
    thumbnail: '/products/featured/crossbody-bag.png',
    videoThumbnail: '/reels/reel-2.png',
    videoSrc: '/reels/dummy-video.mp4',
  },
  {
    id: 'reel-british-loafers',
    name: 'British Style Loafers',
    price: 1899,
    originalPrice: 2799,
    thumbnail: '/products/featured/british-loafers.png',
    videoThumbnail: '/reels/reel-3.png',
    videoSrc: '/reels/dummy-video.mp4',
  },
  {
    id: 'reel-duffle-bag',
    name: 'Luxury Duffle Bag',
    price: 2199,
    originalPrice: 3299,
    thumbnail: '/products/featured/duffle-bag.png',
    videoThumbnail: '/reels/reel-4.png',
    videoSrc: '/reels/dummy-video.mp4',
  },
  {
    id: 'reel-shoulder-bag',
    name: 'Chic Shoulder Bag',
    price: 1499,
    originalPrice: 2199,
    thumbnail: '/products/featured/shoulder-bag.png',
    videoThumbnail: '/reels/reel-5.png',
    videoSrc: '/reels/dummy-video.mp4',
  },
]

function ReelCard({ product, index }: { product: ReelProduct; index: number }) {
  const { addToCart, selectProduct, setView } = useStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showOverlay, setShowOverlay] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {
          // Video play failed, just show thumbnail
        })
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

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
      {/* Video / Thumbnail Card */}
      <div
        className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-900 cursor-pointer"
        onClick={togglePlay}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={product.videoSrc}
          poster={product.videoThumbnail}
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Thumbnail fallback (shown when video isn't playing) */}
        {!isPlaying && (
          <img
            src={product.videoThumbnail}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Sale badge */}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              -{discount}%
            </span>
          )}
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Play/Pause center button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Pause indicator */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              onClick={togglePlay}
            >
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
              >
                <Pause className="w-5 h-5 text-white fill-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Video progress bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 pointer-events-none">
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* Full-screen reel viewer modal */
function ReelViewer({
  product,
  onClose,
}: {
  product: ReelProduct
  onClose: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { addToCart } = useStore()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      if (isPlaying) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, isMuted])

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-[340px] sm:w-[380px] aspect-[9/16] rounded-xl overflow-hidden bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={product.videoSrc}
          poster={product.videoThumbnail}
          muted={isMuted}
          loop
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mute toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Play/Pause */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/20">
              <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-white font-bold text-base">৳{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-white/50 text-xs line-through">৳{product.originalPrice.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="text-red-400 text-[10px] font-bold">-{discount}%</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.thumbnail,
              })
            }}
            className="pointer-events-auto w-full bg-black hover:bg-slate-800 text-white text-sm font-semibold tracking-wider uppercase py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
            Add To Cart
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedReel, setSelectedReel] = useState<ReelProduct | null>(null)

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
    <>
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

      {/* Full-screen reel viewer modal */}
      <AnimatePresence>
        {selectedReel && (
          <ReelViewer product={selectedReel} onClose={() => setSelectedReel(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
