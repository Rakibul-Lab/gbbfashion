# Task 3 - Featured Collections Component

## Task Summary
Created a "Featured Collections" section mimicking thepatchee.com style with "Prime Bags" and "Prime Shoes" tabs, each showing a horizontal scrollable product carousel.

## Files Created
- `/home/z/my-project/src/components/featured-collections.tsx` - New component

## Files Modified
- `/home/z/my-project/src/app/page.tsx` - Replaced `StoriesSection` import with `FeaturedCollections`, updated home view render order

## Component Features
1. **Tab Navigation**: Two centered tabs ("Prime Bags" and "Prime Shoes") with large elegant text (text-2xl/text-3xl), bold active tab with amber underline via framer-motion layout animation
2. **Product Filtering**: 
   - "Prime Bags" shows products in categories 'women' and 'men'
   - "Prime Shoes" shows products in category 'shoes'
3. **Product Cards** (~240px wide):
   - Square aspect ratio image with hover zoom
   - Rose/red "Save X%" discount badge (simulated original price 1.3-2.5x current price)
   - Product name truncated to 1 line
   - Sale price bold + strikethrough original price
   - Star rating with 5 stars and numeric value
   - "Quick Add" button slides up on hover
4. **Horizontal Carousel**: Left/right navigation arrows that appear/disappear based on scroll position, smooth scrolling
5. **"View All" Button**: Centered below carousel, navigates to shop view with appropriate category filter
6. **Animations**: Framer Motion for tab switch, product card stagger, and arrow visibility

## Styling
- Gold/amber accent color scheme
- Rose-600 discount badges
- No Jost font used
- Clean, minimal design
- Responsive (220px mobile / 240px desktop cards)

## Integration
- Uses `useStore` for `selectProduct`, `setView`, `addToCart`, `setCategoryFilter`
- Fetches products from `/api/products`
- Home view order: HeroSection → FeaturedCollections → CategoryCards → PopularProducts → TrustBar
