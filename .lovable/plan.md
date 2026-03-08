

# Landing Page Premium Redesign

## Current State
The page has 11 sections with decent structure but feels uniform — every section uses the same `fadeUp` animation, similar card styles, and repetitive layouts. The "Grandes futuros" gradient text was removed due to mobile issues. The overall feel is "good template" rather than "premium fintech".

## Plan

### 1. Hero — Maximum Visual Impact
- Replace `dot-pattern` background with animated gradient orbs (radial gradients that slowly drift)
- Fix the "Grandes futuros" text: use a proper CSS gradient text technique with inline styles (`WebkitBackgroundClip` + `WebkitTextFillColor`) instead of Tailwind classes that fail on mobile
- Increase headline size: `text-4xl sm:text-5xl md:text-6xl` for stronger first impression
- Add a subtle parallax effect on the hero illustration using `useScroll` + `useTransform`
- Replace floating icon boxes with a more polished "feature pill" strip below the CTA

### 2. Problem Section — Editorial Style
- Switch from vertical cards to a horizontal timeline layout on desktop
- Add large decorative numbers (oversized, semi-transparent) behind each point
- More dramatic spacing and typography contrast

### 3. Solution Section — Split Screen Polish
- Add a subtle gradient overlay on the image side
- Use a `gradient-border` card wrapper for the text content
- Add animated checkmarks that appear sequentially

### 4. How It Works — Connected Steps
- Replace the dashed SVG line with a solid gradient line that animates on scroll
- Larger step icons with animated gradient backgrounds
- Add a subtle "glow" effect on the active/hovered step

### 5. Universe Section — Card Grid Premium
- Switch from 5-column flat grid to a staggered/masonry-style layout
- Add a hover "flip" or "lift" effect with gradient border reveal
- Center the last item when odd count on mobile

### 6. Benefits (Parents + Schools) — Asymmetric Layouts
- Add image masks/clip-paths for a more editorial feel
- Animated progress indicators next to each benefit item
- Subtle background texture variation between sections

### 7. Gamification — Floating Tags
- Add orbital/floating animation to the tags instead of static flex wrap
- Subtle rotation on hover for playfulness

### 8. Trust Section — Glass Cards Enhancement
- Add a subtle animated grid/mesh background
- Larger icons with ring pulse animation
- Stats counter integration into this section

### 9. Social Proof — Testimonial Cards
- Add 2-3 fake testimonial quotes in glass cards
- Horizontal auto-scroll carousel effect
- Better star rating presentation

### 10. Final CTA — Full-Width Gradient
- Full-bleed gradient background (not contained in max-w-6xl)
- Larger Kivo mascot with glow
- Animated particles/sparkles background

### 11. Global Improvements
- **Typography**: Increase section title sizes, add `text-balance` for better line breaks
- **Spacing**: More generous `py-20 md:py-32` for premium breathing room
- **Animations**: Vary entrance animations per section (scale, slide-in, blur-in) instead of uniform fadeUp
- **CSS**: Add new keyframes for `gradient-shift`, `float-slow`, `pulse-glow` in `index.css`
- **Gradient text fix**: Use inline React styles for `WebkitBackgroundClip: 'text'` and `WebkitTextFillColor: 'transparent'` which works reliably across all browsers including mobile Safari

### Files to Modify
- `src/pages/LandingPage.tsx` — Main restructure of all sections
- `src/index.css` — New keyframes and utility classes
- `tailwind.config.ts` — Additional animation definitions if needed

