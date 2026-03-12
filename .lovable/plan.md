

## Subscrições para Professor e Parceiro

### Estado actual
- **3 tiers na DB**: Gratuito, Família Premium, Escola/Institucional
- **0 tiers partner_program** → página `PartnerSubscription` mostra lista vazia
- **0 tiers teacher** → não existe página nem rota de subscrição para professor
- A rota `/partner/subscription` já existe no router e no layout
- A rota `/teacher/subscription` NÃO existe

### O que fazer

**1. Inserir tiers na DB (dados, não schema)**

Inserir 3 tiers partner_program:
| Nome | Preço mensal | Max children | Max programs | Features |
|------|-------------|-------------|-------------|----------|
| Parceiro Starter | 0 | 50 | 2 | basic_wallet, basic_tasks |
| Parceiro Pro | 9990 | 500 | 10 | + advanced_analytics, export_reports, custom_branding |
| Parceiro Enterprise | 49990 | 99999 | 99999 | + api_access, priority_support |

Inserir 2 tiers teacher (novo tier_type `teacher`):
| Nome | Preço | Max children | Features |
|------|-------|-------------|----------|
| Professor Gratuito | 0 | 30 | basic_wallet, basic_tasks, classroom_mode |
| Professor Premium | 4990 | 200 | + advanced_analytics, export_reports, priority_support |

**2. Inserir preços regionais para os novos tiers**

Adicionar registos em `tier_regional_prices` para os 5 tiers pagos (Parceiro Pro, Parceiro Enterprise, Professor Premium) × 6 moedas (MZN, BRL, EUR, USD, CVE, ZAR).

**3. Actualizar AdminSubscriptions para aceitar tier_type `teacher`**

Adicionar `teacher` como opção no enum do formulário e no mapa de labels em `AdminSubscriptions.tsx`.

**4. Criar página TeacherSubscription**

Nova página `src/pages/teacher/TeacherSubscription.tsx` — estrutura semelhante a `PartnerSubscription.tsx` mas filtrando por `tierType === 'teacher'`. Usa `useSubscriptionTiers()` existente.

**5. Criar hook `use-teacher-limits.ts`**

Semelhante a `use-partner-limits.ts` — lê o tier do tenant do professor e calcula limites de alunos/turmas.

**6. Adicionar rota e nav**

- Adicionar rota `/teacher/subscription` no `App.tsx`
- Adicionar item de navegação no `TeacherLayout.tsx`

**7. Actualizar `SubscriptionTier` interface**

Adicionar `teacher` ao enum de `tier_type` no formulário admin.

### Ficheiros a criar/editar
- `src/pages/teacher/TeacherSubscription.tsx` (criar)
- `src/hooks/use-teacher-limits.ts` (criar)
- `src/components/layouts/TeacherLayout.tsx` (adicionar nav item)
- `src/pages/admin/AdminSubscriptions.tsx` (adicionar teacher type)
- `src/App.tsx` (adicionar rota)
- `src/test/role-access.test.ts` (adicionar `/teacher/subscription`)
- DB: inserir 5 novos tiers + preços regionais via insert tool

