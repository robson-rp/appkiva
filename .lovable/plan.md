

## Child Progress Simulator — Landing Page Section

### What
A new interactive section (`ChildProgressSimulator`) placed between `SocialProof` and `PricingSection` in the Landing Page. Parents select their child's age via a slider and instantly see a visual progression timeline with milestones, icons, and a personalized message.

### Component: `src/components/ChildProgressSimulator.tsx`

**Structure:**
1. **Header** — Title + subtitle (i18n keys `sim.title`, `sim.subtitle`)
2. **Age Slider** — Large, touch-friendly slider (5–17), displaying selected age dynamically with animated number
3. **Age Band Card** — Based on selected age, show one of 3 bands:
   - **6–10**: "Hábitos financeiros" — 4 milestones (poupar, missões, metas, recompensas) with icons (Coins, Target, TrendingUp, Trophy)
   - **11–14**: "Responsabilidade financeira" — 3 milestones (mesada, gastos, disciplina) with icons (Wallet, BarChart3, ListChecks)
   - **15–17**: "Independência financeira" — 3 milestones (dinheiro real, carteira digital, decisões) with icons (Banknote, Smartphone, Brain)
4. **Horizontal Timeline** — 4 points: "Hoje → 1 ano → 3 anos → Futuro" with milestone labels and icons at each point, connected by an animated progress line
5. **Dynamic Message** — Personalized text interpolated with age (e.g., `sim.message_habits`, `sim.message_responsibility`, `sim.message_independence`)
6. **CTA** — "Comece hoje a jornada financeira do seu filho" + "Criar conta familiar" button linking to `/login`

**Visual approach:**
- Cards with `rounded-2xl border` consistent with existing design
- Framer Motion `fadeUp` / `stagger` animations matching other sections
- Slider uses existing `@radix-ui/react-slider` component, sized up for touch (h-3 track, h-7 thumb)
- Timeline uses flexbox with connecting line (`bg-primary` bar) and circular milestone dots
- Age band transitions with `AnimatePresence` for smooth card swap

### i18n Keys (~25 new keys)
Added to both `src/i18n/pt.ts` and `src/i18n/en.ts` under `sim.*` domain covering title, subtitle, age label, band titles, milestones, timeline points, dynamic messages, and CTA text.

### Landing Page Integration
In `src/pages/LandingPage.tsx`:
- Import `ChildProgressSimulator`
- Insert `<ChildProgressSimulator />` between `<SocialProof />` and `<PricingSection />` in the page composition
- Add `nav` link for the section if desired

### Analytics
Fire-and-forget tracking calls to `onboarding_analytics` (existing table) with event types: `simulator_open`, `simulator_age_select`, `simulator_cta_click`.

### Files to create/modify
| File | Action |
|------|--------|
| `src/components/ChildProgressSimulator.tsx` | Create |
| `src/i18n/pt.ts` | Add ~25 `sim.*` keys |
| `src/i18n/en.ts` | Add ~25 `sim.*` keys |
| `src/pages/LandingPage.tsx` | Import + place component |

