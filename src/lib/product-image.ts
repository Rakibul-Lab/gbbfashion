/** Shared product image frame — any uploaded image stretches to fill */
export const productImageContainerClass =
  'product-image-frame media-frame relative w-full aspect-square overflow-hidden bg-slate-100 block'

/**
 * Force an <img> to fill its parent frame completely (stretches to width + height).
 * Parent must be `relative` (or use productImageContainerClass / productThumbClass).
 */
export const productImageFitClass =
  'absolute inset-0 !h-full !w-full object-fill object-center'

/** Carousel / horizontal product card width */
export const productCardWidthClass =
  'w-[72vw] min-w-[220px] max-w-[320px] sm:w-[260px] md:w-[280px] lg:w-[300px] shrink-0'

/** Square thumbnails for cart, checkout, admin tables */
export const productThumbClass =
  'product-thumb-frame media-frame relative shrink-0 overflow-hidden bg-slate-50 aspect-square'

/** Approximate carousel scroll step (card + gap) */
export const PRODUCT_CAROUSEL_SCROLL = 320
