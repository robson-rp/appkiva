

# Walkthrough / Onboarding Interactivo — Plano de Implementacao

## Overview

Build a role-based interactive onboarding walkthrough that appears on first login, highlighting key UI elements with step-by-step guidance, Kivo mascot presence, and skip/resume capability. Completion is persisted in the database.

## Database Changes

**New table: `onboarding_progress`**
- `id` uuid PK
- `profile_id` uuid (unique, references profiles)
- `completed` boolean default false
- `current_step` integer default 0
- `completed_at` timestamptz nullable
- `skipped` boolean default false
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

RLS: users can read/insert/update their own record (matched via `profiles.user_id = auth.uid()`).

## New Components

### 1. `src/components/OnboardingWalkthrough.tsx`
Main orchestrator component:
- Fetches/creates `onboarding_progress` for current user profile
- If `completed = true`, renders nothing (unless triggered from help menu)
- Renders an overlay with spotlight highlight on target elements
- Shows a modal-like card at each step with: icon/illustration, title, description, "Next" button, "Skip" link, step counter
- Uses `framer-motion` for transitions between steps
- On completion or skip, updates the database record

### 2. `src/data/onboarding-steps.ts`
Defines step configurations per role:

```typescript
interface OnboardingStep {
  title: string;
  description: string;
  icon: string; // emoji or illustration reference
  highlightSelector?: string; // CSS selector for spotlight (optional)
  position?: 'center' | 'bottom' | 'top';
}

const ONBOARDING_STEPS: Record<UserRole, OnboardingStep[]> = {
  parent: [ /* 6 steps as specified */ ],
  child: [ /* 5 steps */ ],
  teen: [ /* 5 steps, similar to child with teen-specific wording */ ],
  teacher: [ /* 3 steps */ ],
  admin: [ /* 3 steps */ ],
  partner: [ /* 3 steps, similar structure */ ],
};
```

### 3. `src/hooks/use-onboarding.ts`
Custom hook to:
- Query `onboarding_progress` for current profile
- Provide `startWalkthrough()`, `completeStep()`, `skipWalkthrough()`, `resetWalkthrough()` mutations
- Return `{ showOnboarding, currentStep, totalSteps, ... }`

## UI Integration

### Spotlight Overlay
- Full-screen semi-transparent overlay (`bg-black/50`) with a "cutout" around the highlighted element using CSS `clip-path` or a portal-based approach
- Step card positioned near the highlighted element or centered when no element is highlighted (e.g., welcome step)
- Card style: rounded, glassmorphism (`bg-card/95 backdrop-blur-xl`), with Kivo mascot image on welcome steps

### Step Card Design
- Kivo mascot SVG on welcome/intro steps
- Emoji icon for other steps (matching the specification)
- Title in `font-display font-bold`
- Description with bullet points where specified
- "Seguinte" (Next) primary button, "Saltar" (Skip) ghost link
- Step indicator dots at bottom
- KIVARA color palette: deep blue, green, gold accents

### Dashboard Integration
- Render `<OnboardingWalkthrough />` inside each layout component (ParentLayout, ChildLayout, TeenLayout, TeacherLayout, AdminLayout, PartnerLayout) so it appears above the dashboard
- Only renders on dashboard routes (not sub-pages)

### Help Menu Access
- Add "Rever tutorial" option to the existing header/nav area for each role
- Calls `resetWalkthrough()` to re-trigger the walkthrough

## Step Content (Portuguese)

**Parent (6 steps):** Bem-vindo ao KIVARA > Painel Familiar > Atribuir Tarefas > Gestao de Mesada > Metas de Poupanca > Relatorios

**Child (5 steps):** Conhece o Kivo > A Tua Carteira > Completa Missoes > Poupa para os Teus Sonhos > Conquistas

**Teen (5 steps):** Similar to child but with teen-specific financial management language

**Teacher (3 steps):** Painel Escolar > Gerir Alunos > Desafios Financeiros

**Admin (3 steps):** Visao Geral > Gestao de Tenants > Gestao de Subscricoes

**Partner (3 steps):** Painel do Parceiro > Programas > Desafios Patrocinados

## Analytics

Track events by inserting into `audit_log` table (already exists):
- `walkthrough_started`
- `walkthrough_completed`
- `walkthrough_skipped`
- `walkthrough_step_viewed` (with step number in metadata)

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/data/onboarding-steps.ts` | Create — step definitions per role |
| `src/hooks/use-onboarding.ts` | Create — DB queries and mutations |
| `src/components/OnboardingWalkthrough.tsx` | Create — main walkthrough UI |
| `src/components/layouts/ParentLayout.tsx` | Add walkthrough + help menu item |
| `src/components/layouts/ChildLayout.tsx` | Add walkthrough + help menu item |
| `src/components/layouts/TeenLayout.tsx` | Add walkthrough + help menu item |
| `src/components/layouts/TeacherLayout.tsx` | Add walkthrough + help menu item |
| `src/components/layouts/AdminLayout.tsx` | Add walkthrough + help menu item |
| `src/components/layouts/PartnerLayout.tsx` | Add walkthrough + help menu item |
| DB migration | Create `onboarding_progress` table with RLS |

