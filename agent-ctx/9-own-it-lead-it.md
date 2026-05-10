# Task 9: OwnItLeadIt Component Agent

## Task: Create the OwnItLeadIt component

## Work Log
- Read worklog.md to understand previous agent work (Tasks 1-5, 6-7, 2-4)
- Read store.ts to understand available navigation methods (setView, setCategoryFilter)
- Read page.tsx to understand current home view layout and component order
- Verified image asset exists: /public/own-it-lead-it.jpg
- Created /src/components/own-it-lead-it.tsx with:
  - Full-width section with cream/off-white background (#FAFAF8)
  - 2-column flex layout:
    - Left column (58% width): large image using /own-it-lead-it.jpg, 4:3 aspect ratio, subtle bottom gradient overlay
    - Right column (42% width): text content, vertically centered
  - Right column content:
    - "OWN IT." heading in large bold text (text-4xl to text-6xl responsive), slate-900
    - "LEAD IT." heading in dark goldenrod accent color (#b8860b), same sizing, with slight top margin
    - Decorative separator line: 2px height, 16px width, dark goldenrod (#b8860b), with scaleX entrance animation from left
    - Description paragraph: brand story about Baand GBB bags, slate-600, max-w-md
    - "OUR STORY" button: slate-900 bg, white text, tracking-[0.2em] uppercase, hover:bg-slate-700, ArrowRight icon with hover translate
  - Framer-motion entrance animations:
    - Image: fade-in from left (x: -40 to 0), 0.7s duration
    - "OWN IT." heading: fade-in-up (y: 30 to 0), 0.6s
    - "LEAD IT." heading: same with 0.15s delay
    - Separator line: fade-in with scaleX (0 to 1), 0.5s, 0.3s delay, origin-left
    - Description: fade-in-up, 0.6s, 0.4s delay
    - Button: fade-in-up, 0.5s, 0.55s delay
    - All use whileInView with viewport once:true
  - Responsive: stacks vertically on mobile (image top, text bottom), shows 2-column on md+
  - Uses useStore setView for button navigation
- Updated /src/app/page.tsx:
  - Added OwnItLeadIt import
  - Placed component between StoriesSection and TrustBar in home view
- ESLint: No errors
- Dev server compiles successfully

## Stage Summary
- OwnItLeadIt component created with image + text 2-column layout
- "OWN IT." / "LEAD IT." headings with goldenrod accent on second line
- Decorative amber separator line with scaleX animation
- Brand description paragraph and "OUR STORY" CTA button
- Full framer-motion scroll-triggered entrance animations with staggered delays
- Responsive: vertical stack on mobile, side-by-side on md+
- All lint checks pass
