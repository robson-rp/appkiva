

# Carousel Indicators — Dot Style Update

Based on the reference image, the indicators should use a **small circular dot** model instead of the current thin-line bars.

## Changes in `src/pages/LandingPage.tsx` (lines 425-444)

Replace the current thin-line indicators with small circular dots:

- **Inactive dots**: Small circles (`w-2 h-2`), muted color (`bg-muted-foreground/25`), rounded full
- **Active dot**: Slightly larger or same size with solid primary color (`bg-primary`), with a smooth scale/opacity transition
- Keep the progress animation on the active dot as a subtle ring or pulse effect
- Maintain click-to-navigate and aria-labels

```tsx
<div className="relative z-10 flex items-center justify-center gap-2.5 pb-6 md:pb-10">
  {HERO_SLIDES.map((_, i) => (
    <button
      key={i}
      onClick={() => emblaApi?.scrollTo(i)}
      className={`rounded-full transition-all duration-400 ${
        selectedIndex === i
          ? "w-2.5 h-2.5 bg-primary shadow-sm shadow-primary/30"
          : "w-2 h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
      }`}
      aria-label={`Slide ${i + 1}`}
    />
  ))}
</div>
```

**File:** `src/pages/LandingPage.tsx` — lines 425-444

