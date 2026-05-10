'use client'

import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X, ChevronLeft, ChevronRight, Volume2, VolumeX, ChevronDown, Heart, Share2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ReelProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  thumbnail: string
  videoThumbnail: string
  videoSrc: string
  colors?: { name: string; hex: string }[]
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
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Brown', hex: '#8B4513' },
      { name: 'Beige', hex: '#D2B48C' },
    ],
  },
  {
    id: 'reel-crossbody-bag',
    name: 'Premium Crossbody Bag',
    price: 1299,
    originalPrice: 1899,
    thumbnail: '/products/featured/crossbody-bag.png',
    videoThumbnail: '/reels/thumb-2.png',
    videoSrc: '/reels/video-2.mp4',
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Tan', hex: '#D2B48C' },
    ],
  },
  {
    id: 'reel-british-loafers',
    name: 'British Style Loafers',
    price: 1899,
    originalPrice: 2799,
    thumbnail: '/products/featured/british-loafers.png',
    videoThumbnail: '/reels/thumb-3.png',
    videoSrc: '/reels/video-3.mp4',
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Brown', hex: '#8B4513' },
      { name: 'Burgundy', hex: '#800020' },
    ],
  },
  {
    id: 'reel-duffle-bag',
    name: 'Luxury Duffle Bag',
    price: 2199,
    originalPrice: 3299,
    thumbnail: '/products/featured/duffle-bag.png',
    videoThumbnail: '/reels/thumb-4.png',
    videoSrc: '/reels/video-4.mp4',
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1B1B5E' },
    ],
  },
  {
    id: 'reel-shoulder-bag',
    name: 'Chic Shoulder Bag',
    price: 1499,
    originalPrice: 2199,
    thumbnail: '/products/featured/shoulder-bag.png',
    videoThumbnail: '/reels/thumb-5.png',
    videoSrc: '/reels/video-5.mp4',
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Cream', hex: '#FFFDD0' },
      { name: 'Rose', hex: '#FF007F' },
    ],
  },
]

function ReelCard({
  product,
  index,
  onOpen,
}: {
  product: ReelProduct
  index: number
  onOpen: () => void
}) {
  const { addToCart } = useStore()
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
      video.play().catch(() => {})
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

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group"
    >
      {/* Video Card — click to open modal */}
      <div
        ref={cardRef}
        className="relative aspect-[9/16] overflow-hidden rounded-lg bg-slate-900 cursor-pointer hover:ring-2 hover:ring-white/40 transition-all duration-300"
        onClick={onOpen}
      >
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {discount > 0 && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
              -{discount}%
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 pointer-events-none">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-white/20">
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

          <button
            onClick={handleAddToCart}
            className="pointer-events-auto w-full bg-black hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add To Cart
          </button>
        </div>

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

/* Split-screen reel modal — video left, info panel right */
function ReelModal({
  products,
  initialIndex,
  onClose,
}: {
  products: ReelProduct[]
  initialIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { addToCart } = useStore()

  const product = products[currentIndex]

  const switchToIndex = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex)
    setSelectedColor(0)
    setColorDropdownOpen(false)
    setAddedToCart(false)
  }, [])

  // Autoplay video with sound when modal opens or index changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = isMuted
    video.currentTime = 0
    video.play().catch(() => {})
  }, [currentIndex])

  // Sync mute state to video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = isMuted
  }, [isMuted])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const goNext = useCallback(() => {
    switchToIndex((currentIndex + 1) % products.length)
  }, [currentIndex, products.length, switchToIndex])

  const goPrev = useCallback(() => {
    switchToIndex((currentIndex - 1 + products.length) % products.length)
  }, [currentIndex, products.length, switchToIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goNext, goPrev])

  // Close dropdown on outside click
  useEffect(() => {
    if (!colorDropdownOpen) return
    const handler = () => setColorDropdownOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [colorDropdownOpen])

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const currentColor = product.colors?.[selectedColor]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Previous arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); goPrev() }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Next arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); goNext() }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Split-screen modal: Video Left | Info Right */}
      <motion.div
        key={product.id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative flex flex-col sm:flex-row w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT — Video Section */}
        <div className="relative sm:w-1/2 flex-shrink-0 bg-slate-900">
          {/* Video */}
          <video
            ref={videoRef}
            src={product.videoSrc}
            poster={product.videoThumbnail}
            muted={isMuted}
            loop
            autoPlay
            playsInline
            className="w-full h-64 sm:h-full object-cover"
          />

          {/* Sound on/off toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted) }}
            className="absolute bottom-4 left-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Indicator dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {products.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-white w-5' : 'bg-white/40 w-1.5'
                }`}
              />
            ))}
          </div>

          {/* Sale badge on video */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 pointer-events-none">
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-sm">
                -{discount}%
              </span>
            </div>
          )}
        </div>

        {/* RIGHT — Product Info Panel */}
        <div className="sm:w-1/2 flex flex-col p-5 sm:p-8 overflow-y-auto">
          {/* Sale badge (desktop) */}
          {discount > 0 && (
            <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm w-fit mb-3 sm:hidden">
              -{discount}%
            </span>
          )}

          {/* Product Name */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight pr-8">
            {product.name}
          </h3>

          {/* Product Thumbnail + Price */}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-xs font-semibold text-red-500">
                  Save ৳{(product.originalPrice! - product.price).toLocaleString()} ({discount}% off)
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 my-5" />

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-2">
                Color: <span className="text-slate-900 normal-case tracking-normal">{currentColor?.name}</span>
              </p>
              {/* Color Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setColorDropdownOpen(!colorDropdownOpen) }}
                  className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-4 py-2.5 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full border border-slate-200"
                      style={{ backgroundColor: currentColor?.hex }}
                    />
                    <span className="text-sm text-slate-700">{currentColor?.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${colorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown options */}
                <AnimatePresence>
                  {colorDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg overflow-hidden z-10"
                    >
                      {product.colors.map((color, i) => (
                        <button
                          key={color.name}
                          onClick={(e) => { e.stopPropagation(); setSelectedColor(i); setColorDropdownOpen(false) }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors ${
                            i === selectedColor ? 'bg-slate-50' : ''
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full border border-slate-200"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm text-slate-700">{color.name}</span>
                          {i === selectedColor && (
                            <svg className="w-4 h-4 text-emerald-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Add To Cart Button */}
          <button
            onClick={() => {
              addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.thumbnail,
              })
              setAddedToCart(true)
              setTimeout(() => setAddedToCart(false), 2000)
            }}
            className="w-full bg-black hover:bg-slate-800 text-white text-sm font-semibold tracking-wider uppercase py-3.5 rounded-lg flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98]"
          >
            {addedToCart ? (
              <>
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Add To Cart
              </>
            )}
          </button>

          {/* Wishlist + Share */}
          <div className="flex items-center gap-4 mt-4">
            <button className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors text-xs">
              <Heart className="w-4 h-4" />
              Wishlist
            </button>
            <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors text-xs">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Free Delivery
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Cash on Delivery
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                7-Day Returns
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Authentic Product
              </div>
            </div>
          </div>

          {/* Navigation dots (mobile - below info) */}
          <div className="flex items-center justify-center gap-1.5 mt-5 sm:hidden">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); switchToIndex(i) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-slate-900 w-5' : 'bg-slate-300 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function StoriesSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  const openModal = useCallback((index: number) => {
    setModalIndex(index)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
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

          {/* 5 Reels in full-width grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5">
            {reelProducts.map((product, index) => (
              <ReelCard
                key={product.id}
                product={product}
                index={index}
                onOpen={() => openModal(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Split-screen reel modal */}
      <AnimatePresence>
        {modalOpen && (
          <ReelModal
            products={reelProducts}
            initialIndex={modalIndex}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  )
}
