

## Plan: Enrich Splash Screen Illustrations

### Problem
The current illustrations are visually flat — simple icon rows on faint gradient backgrounds. They lack depth, layering, and the premium fintech feel of the KIVARA brand.

### Approach
Rewrite `src/components/SplashIllustration.tsx` with richer compositions:

1. **Layered backgrounds** — Multiple gradient rings/circles with blur effects creating depth (glassmorphism style)
2. **Orbiting elements** — Icons that orbit or pulse around a central focal point instead of just floating vertically
3. **Animated particles** — Small glowing dots/sparkles that drift across the background
4. **Better brand colors** — Use the exact KIVARA palette (#1F4E8C blue, #2F9E7A green, #F2B134 gold) with stronger opacity and richer gradients
5. **Scale entrance animations** — Icons scale in with staggered delays for a reveal effect
6. **Glow effects** — Subtle box-shadow glows on the Kivo mascot and key icons using brand colors
7. **Larger, more confident compositions** — Bigger central elements, decorative concentric rings, and more visual hierarchy

### File Changes

| File | Action |
|---|---|
| `src/components/SplashIllustration.tsx` | Full rewrite with enriched illustration compositions |

### Key Visual Enhancements Per Screen

- **Welcome screens** (parent/child/teacher/admin/partner): Kivo centered with glowing halo ring, orbiting brand icons, animated sparkle particles
- **Task/Mission screens**: Central emoji with pulsing ring, staggered icon entrance from different directions
- **Dashboard/Analytics screens**: Animated bar chart composition using styled divs, icons orbiting
- **Savings/Dreams screens**: Coin stack animation with growing effect, glowing piggy bank
- **Achievement screens**: Trophy with radiating light rays, medals cascading in

### No other files change
Content data and the walkthrough component remain untouched.

