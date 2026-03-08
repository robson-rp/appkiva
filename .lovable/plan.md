

# Landing Page Redesign — Wise-Inspired Style

## Analysis: Wise.com Design Patterns

Wise uses a dramatically different approach from the current KIVARA page:

```text
WISE STYLE                          CURRENT KIVARA
─────────────────────────────────   ─────────────────────────────────
Massive bold headlines (60-80px)    Moderate headlines (40-72px)
Clean, minimal backgrounds          Gradient orbs, glassmorphism everywhere
Strong color blocks per section     Subtle gradients, blurry overlays
Very few decorative elements        Floating icons, sparkles, pulse rings
Simple sans-serif hierarchy          Multiple font families + effects
Generous whitespace, no clutter     Dense cards, many visual layers
Minimal animation (functional)      Heavy animation (decorative)
Content-first, data-driven          Effect-first, visual-driven
```

## Plan

### 1. Typography Overhaul
- Hero headline: bump to `text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem]` (Wise uses ~80px)
- Section titles: `text-3xl sm:text-4xl md:text-5xl` (currently `text-2xl sm:text-3xl md:text-4xl`)
- Body text: `text-lg md:text-xl` for primary descriptions (currently `text-body md:text-body-lg` = 16-18px)
- Subtitles: `text-xl md:text-2xl` max-w-3xl for better readability
- Reduce font variety — lean on `font-display` (Space Grotesk) more consistently

### 2. Strip Visual Noise
- Remove `GradientOrbs` from Hero, Solution, Universe, and CTA sections — replace with clean solid or subtle gradient backgrounds
- Remove floating glass icon boxes from Hero illustration area
- Remove `shimmer` effect from buttons — keep clean solid gradient
- Remove `animate-pulse-glow` blur overlays behind images
- Remove sparkle particles from CTA section
- Simplify the feature pills strip — cleaner, no backdrop-blur

### 3. Section Backgrounds — Bold Color Blocks (Wise-style)
- Hero: clean white/background, no orbs — let typography and illustration carry it
- Problem: subtle warm tint background
- How It Works: light muted background
- Trust/Security: keep dark section but remove grid pattern and pulse rings — clean dark block
- CTA: bold primary color background (like Wise's green) instead of subtle gradient

### 4. Layout Simplification
- Wider max-width: `max-w-7xl` instead of `max-w-6xl` for more breathing room
- Cards: simpler borders, less glassmorphism — clean `bg-card` with subtle shadow
- Remove `gradient-border` pseudo-element decorations
- Simpler hover states: just `y: -4` lift, no scale or rotate

### 5. Hero Cleanup
- Remove Kivo floating mascot from hero (move to CTA only)
- Remove the 3 floating glass icon boxes (Coins, Target, Trophy)
- Keep parallax illustration but without the glow overlay
- Larger, cleaner CTA buttons with more padding
- Feature pills: simpler, no backdrop-blur — just subtle bg with icon

### 6. Content Sections Polish
- Benefits (Parents/Schools): keep split layout but remove the animated left-border bars and spring checkmarks — use simple icon + text rows
- Gamification: static clean chips instead of floating/bouncing tags
- Social Proof: cleaner stat cards without glass effect, testimonials with simple borders

### Files to Modify
- `src/pages/LandingPage.tsx` — All typography sizes, remove decorative elements, simplify backgrounds and hover effects

