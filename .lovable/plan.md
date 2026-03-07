

# UI/UX Redesign -- Plataforma KIVARA (Mobile First)

This is a large-scale redesign touching every layout, dashboard, and component across 6 user roles. To avoid breaking things and to keep iterations manageable, the work is split into 4 phases. Each phase can be implemented and tested before moving to the next.

---

## Phase 1: Design System Foundation

Update the global design tokens, typography, spacing, and base components so all subsequent changes inherit the improvements automatically.

### 1A. Typography & Spacing (`src/index.css`, `tailwind.config.ts`)

- Add **Poppins** as a third font option (headings get `Space Grotesk` or `Poppins`, body stays `Nunito`)
- Define a mobile-first typography scale in CSS custom properties:
  - `--text-heading`: 28px (mobile) / 32px (desktop)
  - `--text-section`: 20px (mobile) / 24px (desktop)
  - `--text-body`: 16px minimum
  - `--text-small`: 14px minimum (replace all `text-[10px]`, `text-[11px]`, `text-[9px]` across the codebase)
- Set global minimum touch target: `min-h-[44px] min-w-[44px]` for all interactive elements
- Increase base gap/padding from `p-4` to `p-4 md:p-6` consistently

### 1B. Button & Card Components (`src/components/ui/button.tsx`, `src/components/ui/card.tsx`)

- Button: increase default height to `h-11` (44px), add `rounded-xl` as default radius
- Card: increase default border-radius to `rounded-2xl`, add subtle `shadow-sm` default

### 1C. Color Contrast Audit (`src/index.css`)

- Increase contrast for `--muted-foreground` in both light and dark themes
- Ensure all text/background combinations meet WCAG AA (4.5:1 for body text)

---

## Phase 2: Layout & Navigation Overhaul

### 2A. Child & Teen Layouts (bottom nav -- mobile first)

**Files**: `src/components/layouts/ChildLayout.tsx`, `src/components/layouts/TeenLayout.tsx`

- Increase bottom nav item touch targets: icons from `h-5 w-5` to `h-6 w-6`, label text from `text-[10px]` to `text-xs` (12px)
- Increase bottom nav padding/height for better finger reach
- Header: increase avatar size, make coin balance more prominent, increase text sizes
- Content area: ensure `pb-28` to avoid bottom nav overlap

### 2B. Parent, Teacher, Partner, Admin Layouts (sidebar + mobile bottom nav)

**Files**: All 4 layout files in `src/components/layouts/`

- **Mobile**: Hide sidebar, show bottom navigation bar (like Teacher already does) for Parent, Partner, and Admin layouts
- Show max 5 items in bottom nav; group remaining under "More" menu
- **Desktop**: Keep sidebar but increase font sizes, touch targets, spacing
- Sidebar nav items: increase to `min-h-[44px]`, text from small to `text-sm`
- Header: increase height from `h-14` to `h-16`, larger logo and actions

### 2C. Bottom Navigation Component (new shared component)

**File**: `src/components/BottomNav.tsx` (new)

- Extract a reusable `BottomNav` component used by all mobile layouts
- Consistent styling: glassmorphism backdrop, 44px touch targets, spring animations
- Support locked items, badges, active indicators

---

## Phase 3: Dashboard Redesigns (per role)

### 3A. Child Dashboard (`src/pages/child/ChildDashboard.tsx`)

- Hero card: increase balance text to `text-5xl`, Kivo mascot larger
- Quick stats: increase card padding, icon sizes (`h-6 w-6`), text sizes
- Replace all `text-[10px]` labels with `text-xs` or `text-sm`
- Cards: `rounded-2xl`, increased padding `p-5`
- Ensure single-column vertical scroll on mobile

### 3B. Teen Dashboard (`src/pages/teen/TeenDashboard.tsx`)

- Adopt a cleaner fintech card style: minimal gradients, sharper typography
- Stats grid: increase card sizes, use `text-xl` for values
- Progress bar: increase height from `h-2` to `h-3`
- Remove cartoon elements, use more muted professional tones

### 3C. Parent Dashboard (`src/pages/parent/ParentDashboard.tsx`)

- Hero card: larger text, clearer CTA button
- Stats grid: `grid-cols-2` on mobile (already done), increase padding
- Children list and activity: larger avatars, bigger text, more spacing
- Quick action (Send Allowance): make it more prominent with larger button

### 3D. Teacher Dashboard (`src/pages/teacher/TeacherDashboard.tsx`)

- Stats: increase all text sizes
- Charts: increase height from `h-64` to `h-72`, larger axis labels
- Leaderboard: larger student rows, bigger avatars
- Pedagogical tips: increase text from `text-xs` to `text-sm`

### 3E. Partner Dashboard (`src/pages/partner/PartnerDashboard.tsx`)

- Add gradient hero card (like Parent/Teacher already have)
- KPI cards: increase size, add trend indicators
- Add chart placeholders for engagement metrics
- Professional fintech style with clean spacing

### 3F. Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)

- Increase card text sizes throughout
- Chart area: larger, better labeled
- Distribution cards: larger, clearer
- Enterprise-grade spacing and typography

---

## Phase 4: Accessibility & Performance

### 4A. Accessibility Pass (all files)

- Add `aria-label` to all icon-only buttons
- Add `role` attributes where needed
- Ensure focus ring visibility on all interactive elements
- Add `sr-only` labels for screen readers on decorative elements

### 4B. Animation Optimization

- Reduce/remove `filter: 'blur(4px)'` from page transitions (expensive on mobile)
- Keep animations subtle: `scale` max 1.02, short durations
- Add `prefers-reduced-motion` media query support

---

## Implementation Order

Given the scope, I recommend implementing this across multiple messages:

1. **Phase 1** (foundation) -- do first, benefits everything
2. **Phase 2** (layouts) -- mobile nav for all roles
3. **Phase 3** (dashboards) -- 2-3 dashboards per message
4. **Phase 4** (polish) -- final pass

Shall I proceed with **Phase 1** first?

