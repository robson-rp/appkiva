

## Financial Habits Test — New Landing Page Section

### What
A new interactive quiz component (`FinancialHabitsQuiz`) placed between `ChildProgressSimulator` and `PricingSection`. Parents answer 5 multiple-choice questions to get a financial habits score for their child, with a personalized result and CTA.

### Component: `src/components/FinancialHabitsQuiz.tsx`

**Flow (4 states):**
1. **Intro** — Title, subtitle, "Tempo estimado: 2 min" badge, "Começar o teste" button
2. **Quiz** — 5 questions shown one at a time with progress bar, card-based answer options (3 each, scoring 1/2/3 points), animated transitions between questions
3. **Result** — Score-based result (5–7 / 8–11 / 12–15) with title, message, and "Como KIVARA pode ajudar" bullet list
4. **CTA** — "Criar conta familiar" button linking to `/login`

**Questions (all hardcoded via i18n keys):**
- Q1: Mesada/recompensas (Nunca / Às vezes / Regularmente)
- Q2: Sabe poupar (Ainda não / Às vezes / Sim)
- Q3: Precisar vs querer (Ainda não / A aprender / Sim)
- Q4: Decisões financeiras (Nunca / Às vezes / Frequentemente)
- Q5: Metas de poupança (Não / Algumas vezes / Sim)

**Visual approach:**
- Progress bar at top showing question X/5
- Each question in a card with icon, radio-style answer cards (large touch targets)
- Framer Motion `AnimatePresence` for question transitions
- Result card with colored badge based on score tier
- Consistent with existing design (rounded-2xl, border, shadow-sm)

### i18n Keys (~40 new keys)
Added to `pt.ts` and `en.ts` under `quiz.*` domain: title, subtitle, time badge, questions, options, result titles/messages, recommendation bullets, CTA text.

### Landing Page Integration
- Import `FinancialHabitsQuiz`
- Place between `<ChildProgressSimulator />` and `<PricingSection />`
- Add `nav.quiz` link to navbar pointing to `#teste`

### Files to create/modify
| File | Action |
|------|--------|
| `src/components/FinancialHabitsQuiz.tsx` | Create |
| `src/i18n/pt.ts` | Add ~40 `quiz.*` keys |
| `src/i18n/en.ts` | Add ~40 `quiz.*` keys |
| `src/pages/LandingPage.tsx` | Import + place + nav link |

