# Task 2: Hero Section & Promotional Banners

## Summary
Created two thepatchee.com-style components for the GBB Fashion e-commerce site: a stunning hero section and promotional banners section.

## Files Created/Modified

### `/src/components/hero-section.tsx` (Rewritten)
- Full-width banner with `/public/hero-fashion.png` background
- 4-layer z-index architecture ensuring text visibility even without image
- Left-aligned text: "TIMELESS ELEGANCE" tagline with decorative lines, "Redefine Your Style" heading with amber accent, description with ৳765 pricing
- Two CTA buttons: "Shop Women" (solid dark) and "Shop All" (outlined)
- Promo strip with 3 trust badges: Free Shipping, Easy Returns, Cash on Delivery
- framer-motion entrance animations, responsive design
- Uses `useStore` with `setView` and `setCategoryFilter`

### `/src/components/promo-banners.tsx` (New)
- Two stacked promotional banners with parallax fixed backgrounds
- Banner 1 "THE PRIME DROP": left-aligned "UPTO 50% OFF" text, amber CTA
- Banner 2 "LUXE LEATHER": right-aligned heading + description, outlined CTA
- CSS `background-attachment: fixed` for parallax effect
- Scroll-triggered framer-motion animations (`whileInView`)
- Store navigation via `setView` and `setCategoryFilter`

### `/src/app/page.tsx` (Updated)
- Added `PromoBanners` import
- Home view now: HeroSection → FeaturedCollections → PromoBanners → CategoryShowcase → StoriesSection → TrustBar

## Verification
- `bun run lint` — no errors
- Dev server compiles successfully
