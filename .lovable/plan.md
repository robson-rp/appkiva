

## Plan: Add 4 New Micro-Lessons

Since lessons are now database-driven with `mockLessons` as fallback, we need to update **both** the static file and seed the new lessons into the database.

### New Lessons

1. **Juros Compostos: A Bola de Neve** (lesson-7) -- `investing`, `advanced`, 5 min, 30 pts
   - Content: compound interest explained with snowball metaphor, Rule of 72, comparison table simple vs compound
   - Quiz: 3 questions on compound interest mechanics

2. **Inflacao: O Preco que Sobe** (lesson-8) -- `budgeting`, `intermediate`, 4 min, 20 pts
   - Content: what inflation is, how it erodes purchasing power, how saving/investing protects against it
   - Quiz: 3 questions on inflation effects

3. **Moeda e Cambio** (lesson-9) -- `investing`, `intermediate`, 4 min, 20 pts
   - Content: why different countries have different currencies, exchange rates, how travel/trade works
   - Quiz: 3 questions on currency exchange

4. **O Teu Primeiro Negocio** (lesson-10) -- `earning`, `advanced`, 5 min, 30 pts
   - Content: step-by-step guide to starting a small business, costs vs revenue, profit calculation
   - Quiz: 3 questions on business basics

### Changes

| File | Action |
|---|---|
| `src/data/lessons-data.ts` | Append 4 new lesson objects to `mockLessons` array |
| DB migration | INSERT 4 new lessons into `public.lessons` table with `sort_order` 7-10 |

Both changes keep the static fallback and the live database in sync.

