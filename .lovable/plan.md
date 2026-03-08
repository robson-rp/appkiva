

# Tradução Completa da Plataforma + Vinculação da Moeda ao Back Office

## Dimensão do Problema

A plataforma tem **~55 ficheiros** com strings hardcoded em português (35 páginas + 20 componentes), totalizando **~900+ strings** a traduzir. Os dicionários atuais têm apenas ~60 chaves cada (landing page e perfis).

## Estratégia

### Fase 1 — Expandir os dicionários (pt.ts / en.ts)

Organizar por domínio, cobrindo **todas** as áreas da plataforma:

| Domínio | Exemplos de chaves | Estimativa |
|---------|-------------------|------------|
| `nav.*` | Menus de navegação (Parent, Child, Teen, Teacher, Partner, Admin layouts) | ~40 chaves |
| `landing.*` | Todas as secções da LandingPage (Hero slides, Problem, Solution, HowItWorks, Universe, Benefits, Gamification, Trust, Social, Footer) | ~120 chaves |
| `parent.*` | Dashboard, Children, Tasks, Allowance, Vaults, Rewards, Reports, Consent, Support | ~100 chaves |
| `child.*` | Dashboard, Tasks, Missions, Wallet, Vaults, Dreams, Store, Diary, Achievements, Profile | ~80 chaves |
| `teen.*` | Dashboard, Wallet, Tasks, Missions, Vaults, Analytics, Profile | ~60 chaves |
| `teacher.*` | Dashboard, Classes, Challenges, SchoolProfile | ~40 chaves |
| `partner.*` | Dashboard, Programs, Challenges, Reports, Profile | ~50 chaves |
| `admin.*` | Dashboard, Users, Tenants, Finance, Subscriptions, etc. | ~80 chaves |
| `common.*` | Botões (Guardar, Cancelar, Eliminar), estados (A carregar, Erro), labels genéricos | ~50 chaves |
| `auth.*` | Login, Signup, esqueci palavra-passe | ~20 chaves |
| `notifications.*` | Tipos de notificação, templates | ~20 chaves |

**Total estimado: ~660 chaves** em cada dicionário.

### Fase 2 — Aplicar `t()` em todos os ficheiros

Substituir cada string hardcoded por `t('chave.correspondente')`. Ficheiros a alterar:

- **Landing**: `LandingPage.tsx` (Hero slides, todas as secções inline)
- **Layouts**: `ParentLayout.tsx`, `ChildLayout.tsx`, `TeenLayout.tsx`, `TeacherLayout.tsx`, `PartnerLayout.tsx`, `AdminLayout.tsx`
- **Páginas Parent**: `ParentDashboard.tsx`, `ParentChildren.tsx`, `ParentTasks.tsx`, `ParentAllowance.tsx`, `ParentVaults.tsx`, `ParentRewards.tsx`, `ParentReports.tsx`, `ParentConsent.tsx`, `ParentSupport.tsx`, `ParentSubscription.tsx`, `ParentProfile.tsx`
- **Páginas Child**: `ChildDashboard.tsx`, `ChildTasks.tsx`, `ChildMissions.tsx`, `ChildWallet.tsx`, `ChildVaults.tsx`, `ChildDreams.tsx`, `ChildStore.tsx`, `ChildDiary.tsx`, `ChildAchievements.tsx`, `ChildProfile.tsx`
- **Páginas Teen**: `TeenDashboard.tsx`, `TeenWallet.tsx`, `TeenTasks.tsx`, `TeenMissions.tsx`, `TeenVaults.tsx`, `TeenAnalytics.tsx`, `TeenProfile.tsx`
- **Páginas Teacher/Partner/Admin**: Todas as restantes
- **Componentes partilhados**: `SendAllowanceDialog.tsx`, `EditChildDialog.tsx`, `PaymentSimulator.tsx`, `PlanSummaryWidget.tsx`, `StreakWidget.tsx`, `WeeklyChallenges.tsx`, `DailyMissionCard.tsx`, `OnboardingWalkthrough.tsx`, `LessonViewer.tsx`, `NotificationDropdown.tsx`, `UpgradePrompt.tsx`, etc.
- **Auth**: `Login.tsx`

### Fase 3 — Vincular moeda ao Back Office

Atualmente o `PricingSection` usa um seletor de moeda local (state `currency`). O `CurrencyDisplay` já se vincula ao tenant via `useTenantCurrency()`.

**Alteração**: Unificar a lógica de moeda:
1. Na **landing page** (visitante não autenticado): manter o seletor manual de moeda — funciona com `currency_exchange_rates` e `tier_regional_prices` geridos no Back Office (Admin → Currencies e Admin → Subscriptions)
2. Na **plataforma** (utilizador autenticado): a moeda vem do **tenant** (`tenants.currency`), que é definido pelo admin no Back Office. Quando o utilizador muda a moeda no perfil, chama `update_tenant_currency()` (já existe). Isto garante que preços e valores reais são sempre consistentes com o que o admin configurou nas tabelas `supported_currencies` e `currency_exchange_rates`.
3. Garantir que o `ParentSubscription.tsx` usa a mesma moeda do tenant (já faz via `CurrencyDisplay`) e que os preços regionais (`tier_regional_prices`) são respeitados.

**Nenhuma migração DB necessária** — as tabelas e funções já existem.

## Ficheiros

### Novos/Reescritos
| Ficheiro | Descrição |
|----------|-----------|
| `src/i18n/pt.ts` | Expandir de ~60 para ~660 chaves |
| `src/i18n/en.ts` | Expandir de ~60 para ~660 chaves |

### Alterados (~55 ficheiros)
Todos os ficheiros de páginas e componentes listados acima para substituir strings hardcoded por chamadas `t()`.

## Observações
- As strings do admin podem permanecer em PT numa primeira fase (administradores são internos)
- Os dados dinâmicos (nomes de lições, notificações, etc.) vêm da DB e não são traduzidos pelo i18n — isso requer uma coluna `locale` nas tabelas de conteúdo, que está fora do scope atual
- A moeda na plataforma já está vinculada ao Back Office via `useTenantCurrency()` → `tenants.currency` → `supported_currencies`; na landing usa conversão dinâmica via `currency_exchange_rates`

