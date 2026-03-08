

# Hero Carousel — Sliding Line Indicator (Login Style)

Replace the current dot indicators in the Hero carousel with the same "sliding line" style used in `LoginBannerCarousel.tsx`.

## Change in `src/pages/LandingPage.tsx` (lines 425-439)

Replace the dot-style indicators with a thin horizontal track + sliding highlight segment:

```tsx
{/* Slide indicators — sliding line */}
<div className="relative z-10 pb-2 md:pb-3 px-5 sm:px-8">
  <div className="relative h-[1.5px] mx-12 rounded-full bg-muted-foreground/8">
    <div
      className="absolute inset-y-0 left-0 rounded-full bg-primary/50 transition-[left,width] duration-500 ease-out"
      style={{
        width: `${100 / HERO_SLIDES.length}%`,
        left: `${(selectedIndex / HERO_SLIDES.length) * 100}%`,
      }}
    />
  </div>
</div>
```

This matches the exact pattern from `LoginBannerCarousel.tsx` — a 1.5px track with a proportionally-sized highlight that slides between positions.

