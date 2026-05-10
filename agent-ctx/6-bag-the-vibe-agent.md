# Task 6 - BagTheVibe Component Agent

## Task: Create the BagTheVibe component matching thepatchee.com design

## Work Completed:
- Created `/src/components/bag-the-vibe.tsx` with full implementation
- Added BagTheVibe to page.tsx home view between BackpackSeries and StoriesSection
- All lint checks pass (no errors)
- Dev server compiles successfully

## Component Details:
- Section heading: "BAG THE VIBE" large bold tracking-widest uppercase centered
- Left column: lifestyle image with aspect-[3/4], dark gradient overlay, tagline
- Right column: TRENDING badge, product image, name, price (৳1,025 / ৳2,562 strikethrough), VIEW PRODUCT button
- framer-motion whileInView fade-in-up animations with staggered delays
- Hover effects on lifestyle image, product image, and CTA button
- Responsive: stacks vertically on mobile, 2-column on md+
- useStore navigation on VIEW PRODUCT click
