# Task 2: Fix Hero Section Text Visibility

## Summary
Fixed the hero section where text ("Mother's Day Special / Celebrate Her / With Elegance") was hidden/not visible.

## Root Cause
The hero section relied entirely on a background `<img>` tag that was in the document flow (not absolutely positioned). When the image failed to load or was slow:
- The section had no background color/fallback
- White text on white background = invisible content
- The z-index layering was inconsistent (overlays used z-10/z-20 but the image had no z-index)

## Changes Made to `/home/z/my-project/src/components/hero-section.tsx`

### 1. Added Gradient Background Fallback (z-0)
- Always-visible dark gradient background: `linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #292524 60%, #78350f 100%)`
- Slate-900 → Slate-800 → Stone-800 → Amber-900 gradient ensures text is always readable

### 2. Fixed Image Layering (z-[1])
- Made the `<img>` absolutely positioned (was in flow before)
- Added `opacity-40 mix-blend-overlay` so it enhances without dominating
- Added `onError` handler to hide image entirely if it fails to load

### 3. Proper Gradient Overlays (z-[2])
- Left-to-right dark gradient for text contrast
- Bottom-to-top gradient for depth
- Radial warm amber vignette for premium feel

### 4. Text Content Layer (z-[3])
- All text and buttons guaranteed above all other layers
- Removed `Jost` font reference — using `font-serif` for elegance
- Added decorative divider line with amber gradient
- Added inline icons (Truck, Heart, RotateCcw) to promo strip items
- Improved button hover effects with shadow transitions

### Key Architecture
```
z-0  : Gradient background (ALWAYS visible)
z-[1]: Hero image (optional enhancement)
z-[2]: Dark/warm overlays (text readability)
z-[3]: Text content + CTAs (always on top)
```

## Verification
- `bun run lint` passed with no errors
- Dev server compiled successfully
- Text is now always visible regardless of image loading status
