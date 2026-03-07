

## Plan: Role-Based Splash Screens for KIVARA

### Overview

Create a full-screen, role-based splash screen system that replaces the current `OnboardingWalkthrough` spotlight-style walkthrough with a visually rich, illustration-driven splash experience. The system reuses the existing `onboarding_progress` table for persistence.

### Architecture

The existing onboarding system (`OnboardingWalkthrough` + `use-onboarding` hook + `onboarding_progress` table) already handles:
- First-login detection
- Step tracking and persistence
- Skip/complete logic
- Role-based step definitions

We will **replace** the walkthrough component and step data while keeping the hook and database table intact.

### Files to Change

| File | Action |
|---|---|
| `src/data/onboarding-steps.ts` | Replace all step data with the new splash screen content per role (parent, child, teen, teacher, admin, partner). Teen reuses child screens with slight tone adjustment. Partner keeps existing content adapted. |
| `src/components/OnboardingWalkthrough.tsx` | Complete rewrite as a full-screen splash carousel. Remove spotlight/clip-path logic. New design: full-screen overlay with large SVG illustration area, title, description text, progress dots, Skip/Next/Start buttons, Kivo mascot, smooth slide animations. |
| `src/components/SplashIllustration.tsx` | **New file.** Inline SVG illustrations for each splash screen, rendered based on a key (e.g., `family-welcome`, `child-kivo`, `teacher-classroom`, `admin-dashboard`). Uses brand colors (deep blue #1F4E8C, green #2F9E7A, gold #F2B134) with soft gradients. |

### Splash Screen Content Mapping

**Parent (6 screens → 4 screens):**
1. Welcome to KIVARA (family + Kivo illustration)
2. Turn daily tasks into financial lessons
3. Follow your child's financial journey
4. Help children save for their dreams

**Child (5 screens → 4 screens):**
1. Hi! I'm Kivo (Kivo waving)
2. Earn coins by completing missions
3. Save coins for things you really want
4. Unlock badges and achievements

**Teen:** Same as child with slightly adjusted tone.

**Teacher (3 screens):**
1. Bring financial education to your classroom
2. Manage students and learning progress
3. Engage students with financial challenges

**Admin (3 screens):**
1. Welcome to the KIVARA Admin Console
2. Manage organizations and users
3. Track platform growth and activity

**Partner (3 screens):** Adapted from existing content.

### Visual Design

- Full-screen modal overlay with `bg-gradient-to-b` using brand colors
- Large illustration area (top 50% of screen) with inline SVG compositions
- Kivo mascot appears on screen 1 for all roles
- Rounded card at bottom with title, text, dots, and buttons
- Responsive: on mobile the illustration scales down, text stays readable
- Animations: `framer-motion` slide transitions between screens (horizontal swipe feel)
- Navigation dots at bottom showing progress
- Buttons: "Skip" (text link), "Next" / "Start using platform" (primary button)

### Illustration Approach

Since we cannot load external images, all illustrations will be composed using:
- Emoji-based decorative elements at large scale
- CSS gradient backgrounds creating scene contexts
- The existing Kivo SVG mascot (`src/assets/kivo.svg`)
- Lucide icons combined creatively (e.g., PiggyBank, Target, Trophy, BarChart3, Users, BookOpen)

Each illustration will be a styled div composition rather than a complex SVG, keeping it maintainable and performant.

### Data Model

No database changes needed. The existing `onboarding_progress` table with `current_step`, `completed`, `skipped`, `completed_at` fields handles everything. The `use-onboarding` hook remains unchanged.

### What Won't Change

- `src/hooks/use-onboarding.ts` — unchanged
- `onboarding_progress` table — unchanged
- Layout files that render `OnboardingWalkthrough` — unchanged (component name stays the same)

