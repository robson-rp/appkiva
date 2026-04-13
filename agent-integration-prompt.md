# Agent Prompt — Integração completa da API Laravel no Frontend KIVARA

## Objetivo
Substituir **toda** a camada de dados Supabase do frontend React por chamadas à API REST Laravel.
Após esta tarefa, a dependência `@supabase/supabase-js` deve ser removida e o diretório
`src/integrations/supabase/` eliminado.

---

## Contexto do projeto

### Stack Frontend
- **React 18 + TypeScript + Vite** (PWA + Capacitor para iOS/Android)
- **TanStack Query v5** (`@tanstack/react-query`) — todas as queries e mutations
- **React Router v6**
- **shadcn/ui + Tailwind CSS**
- **Zod + React Hook Form** para validação de formulários
- Branch: `copilot/create-kivara-backend-api`
- Working directory: `C:\Users\rtp\Documents\GitHub\appkiva`

### Stack Backend
- **Laravel 12** com JWT (`tymon/jwt-auth`)
- **172 rotas REST** prefixadas em `/api/v1/`
- Todos os requests autenticados exigem:
  - `Authorization: Bearer <jwt_token>`
  - `X-Tenant-ID: <tenant_uuid>`
- Base URL de desenvolvimento: `http://localhost:8000/api/v1`
- A spec completa da API está em `openapi.yaml` na raiz do repositório

### Estado atual (PROBLEMA)
Toda a camada de dados usa Supabase diretamente:
- `src/integrations/supabase/client.ts` — cliente Supabase
- `src/integrations/supabase/types.ts` — tipos gerados pelo Supabase
- `src/contexts/AuthContext.tsx` — usa `supabase.auth.*`
- `src/hooks/use-*.ts` (50+ ficheiros) — todos usam `import { supabase } from '@/integrations/supabase/client'`
- `src/lib/notify.ts` — usa `supabase.from('notifications')`
- `src/lib/ledger-api.ts` — usa `supabase.functions.invoke('create-transaction')`

---

## O que implementar

### FASE 1 — API Client centralizado

Criar `src/lib/api-client.ts` com um cliente HTTP tipado:

```typescript
// Responsabilidades:
// 1. Base URL configurável via VITE_API_URL (fallback: http://localhost:8000/api/v1)
// 2. Lê o JWT do localStorage (chave: 'kivara_token')
// 3. Lê o tenant ID do localStorage (chave: 'kivara_tenant_id')
// 4. Injeta automaticamente: Authorization + X-Tenant-ID em todos os requests
// 5. Se receber 401 → tenta refresh via POST /auth/refresh com 'kivara_refresh_token'
//    - Se o refresh funcionar: guarda novo token e retenta o request original
//    - Se falhar: limpa storage e redireciona para /login
// 6. Expõe: api.get<T>(path), api.post<T>(path, body), api.patch<T>(path, body),
//           api.put<T>(path, body), api.delete<T>(path)
// 7. Em caso de erro HTTP, lança um ApiError com { message, status, errors }
```

Usar `fetch` nativo (não Axios). Criar também o tipo `ApiError`.

### FASE 2 — AuthContext reescrito

Reescrever completamente `src/contexts/AuthContext.tsx`.

**Endpoints utilizados:**
- `POST /auth/login` → body: `{ email, password }` → retorna `{ token, refresh_token, user: { id, name, email, role, profile_id, household_id, tenant_id, avatar } }`
- `POST /auth/child-login` → body: `{ username, pin }` → retorna o mesmo
- `POST /auth/register` → body: `{ name, email, password, role, country?, gender?, phone?, institution_name?, sector?, school_tenant_id?, invite_code? }`
- `POST /auth/logout` → invalida o token no servidor
- `GET /auth/me` → retorna o utilizador atual (usado no boot da app)
- `POST /auth/refresh` → body: `{ refresh_token }` → retorna novo `{ token, refresh_token }`
- `POST /auth/forgot-password` → body: `{ email }`
- `POST /auth/reset-password` → body: `{ token, email, password, password_confirmation }`
- `POST /auth/trusted-devices` → body: `{ device_name }` → retorna `{ device_token }`
- `DELETE /auth/trusted-devices/{deviceToken}`

**Manter a mesma interface pública** (`KivaraUser`, `AuthContextType`) para não quebrar componentes.

**Armazenamento de tokens:**
```
localStorage.setItem('kivara_token', token)
localStorage.setItem('kivara_refresh_token', refresh_token)
localStorage.setItem('kivara_tenant_id', user.tenant_id)
```

**Child login:** chamar `POST /auth/child-login` com `{ username, pin }` diretamente.

**Sem Supabase Realtime** — remover toda a lógica `supabase.auth.onAuthStateChange`.
No boot da app, verificar se existe token em storage e chamar `GET /auth/me` para restaurar sessão.

**Idle timeout:** manter a lógica existente (30 min para parent, 15 min para admin).

**2FA:** a API Laravel responde com `requires_2fa: true` no login — manter o flag `pending2FA`.

### FASE 3 — Hooks reescritos (todos os `src/hooks/use-*.ts`)

Para cada hook, substituir as queries Supabase pelo endpoint Laravel equivalente.
Usar sempre `api.get / api.post / api.patch / api.delete` do api-client.

**Mapeamento de endpoints por hook:**

#### Children
- `useChildren()` → `GET /children`
- `useUpdateChildBudget()` → `PATCH /children/{childId}` com `{ monthly_budget }`
- `useUpdateChildDailyLimit()` → `PATCH /children/{childId}` com `{ daily_spend_limit }`
- `useUpdateChild()` → `PATCH /children/{childId}`
- Adicionar: `useCreateChild()` → `POST /children`
- Adicionar: `useDeleteChild()` → `DELETE /children/{id}`
- Adicionar: `useChildSummary()` → `GET /children/{childId}/summary`
- Adicionar: `useSetChildPin()` → `POST /children/{childId}/pin`

#### Wallet
- `useWalletBalance()` → `GET /wallets/{walletId}/balance` (listar wallets primeiro: `GET /wallets`)
- `useWalletTransactions()` → `GET /wallets/{walletId}/transactions`
- Adicionar: `useWalletFreeze()` → `POST /wallets/{walletId}/freeze`
- Adicionar: `useWalletUnfreeze()` → `POST /wallets/{walletId}/unfreeze`
- Adicionar: `useWalletTransfer()` → `POST /wallets/transfer`
- **Sem Supabase Realtime**: usar `refetchInterval: 15000` no TanStack Query

#### Tasks
- `useTasks()` / `useHouseholdTasks()` → `GET /tasks`
- `useCreateTask()` → `POST /tasks`
- `useUpdateTask()` → `PATCH /tasks/{id}`
- `useDeleteTask()` → `DELETE /tasks/{id}`
- `useCompleteTask()` → `POST /tasks/{id}/complete`
- `useApproveTask()` → `POST /tasks/{id}/approve`
- `useRejectTask()` → `POST /tasks/{id}/reject`

#### Missions
- `useMissions()` → `GET /missions`
- `useCreateMission()` → `POST /missions`
- `useUpdateMission()` → `PATCH /missions/{id}`
- `useDeleteMission()` → `DELETE /missions/{id}`
- `useStartMission()` → `POST /missions/{id}/start`
- `useCompleteMission()` → `POST /missions/{id}/complete`
- `useMissionTemplates()` → `GET /mission-templates`

#### Allowances
- `useAllowanceConfigs()` → `GET /allowances`
- `useCreateAllowance()` → `POST /allowances`
- `useUpdateAllowance()` → `PATCH /allowances/{id}`
- `useDeleteAllowance()` → `DELETE /allowances/{id}`
- `useProcessAllowances()` → `POST /allowances/process`
- `useSendAllowanceNow()` → `POST /allowances/{configId}/send-now`

#### Rewards
- `useRewards()` → `GET /rewards`
- `useCreateReward()` → `POST /rewards`
- `useUpdateReward()` → `PATCH /rewards/{id}`
- `useDeleteReward()` → `DELETE /rewards/{id}`
- `useClaimReward()` → `POST /rewards/{id}/claim`

#### Savings Vaults
- `useSavingsVaults()` → `GET /savings-vaults`
- `useCreateSavingsVault()` → `POST /savings-vaults`
- `useUpdateSavingsVault()` → `PATCH /savings-vaults/{id}`
- `useDeleteSavingsVault()` → `DELETE /savings-vaults/{id}`
- `useVaultDeposit()` → `POST /savings-vaults/{id}/deposit`
- `useVaultWithdraw()` → `POST /savings-vaults/{id}/withdraw`
- `useVaultInterestHistory()` → incluído na resposta de show vault

#### Dream Vaults
- `useDreamVaults()` → `GET /dream-vaults`
- `useCreateDreamVault()` → `POST /dream-vaults`
- `useUpdateDreamVault()` → `PATCH /dream-vaults/{id}`
- `useDeleteDreamVault()` → `DELETE /dream-vaults/{id}`
- `useContributeDreamVault()` → `POST /dream-vaults/{id}/contribute`
- `useDreamVaultComments()` → `GET /dream-vaults/{id}/comments`
- `useAddDreamVaultComment()` → `POST /dream-vaults/{id}/comments`
- `useDeleteDreamVaultComment()` → `DELETE /dream-vaults/{id}/comments/{commentId}`

#### Households
- `useHouseholdGuardians()` → `GET /households/{id}/guardians`
- `useHouseholdMembers()` → `GET /households/{id}/members`
- `useCreateHousehold()` → `POST /households`
- `useUpdateHousehold()` → `PATCH /households/{id}`
- `useGenerateHouseholdInvite()` → `POST /households/{id}/invite`
- `useJoinHousehold()` → `POST /households/join`
- `useAcceptInvite()` → `POST /invite/accept/{code}`

#### Lessons / Education
- `useLessons()` → `GET /lessons`
- `useLessonProgress()` → `GET /lessons/{id}/progress`
- `useAllLessonsProgress()` → `GET /lessons/progress`
- `useRecordLessonProgress()` → `POST /lessons/{id}/progress`
- `useCompleteLesson()` → `POST /lessons/{id}/complete`

#### Gamification
- `useBadges()` → `GET /badges`
- `useBadgeProgress()` → `GET /badges/progress`
- `useKivaPoints()` → `GET /kiva-points`
- `useStreaks()` → `GET /streaks`
- `useRecordDailyActivity()` → `POST /streaks/activity`
- `useHouseholdRankings()` → `GET /leaderboard/household`
- `useWeeklyChallenges()` → `GET /challenges/weekly`
- `useCollectiveChallenges()` → `GET /challenges/collective`
- `useCompleteChallenge()` → `POST /challenges/{id}/complete`

#### Notifications
- `useNotifications()` → `GET /notifications`
- `useMarkNotificationRead()` → `PATCH /notifications/{id}/read`
- `useMarkAllNotificationsRead()` → `POST /notifications/mark-all-read`
- `useDeleteNotification()` → `DELETE /notifications/{id}`
- **Sem Supabase Realtime**: usar `refetchInterval: 30000`

#### Subscription
- `useSubscriptionTiers()` → `GET /subscription/tiers`
- `useSubscriptionCurrent()` → `GET /subscription`
- `useUpgradeSubscription()` → `POST /subscription/subscribe` com `{ tier_id }`
- `useCancelSubscription()` → `POST /subscription/cancel`
- `useInvoices()` → `GET /subscription/invoices`

#### Feature Gate
- `useFeatureGate()` / `useAllFeatures()` → usa os dados de `GET /subscription` (campo `features` do tier retornado)
- **Sem Supabase Realtime**: usar `staleTime: 30000`, `refetchInterval: 60000`

#### School
- `useClassrooms()` → `GET /classrooms`
- `useClassroom()` → `GET /classrooms/{id}`
- `useCreateClassroom()` → `POST /classrooms`
- `useUpdateClassroom()` → `PATCH /classrooms/{id}`
- `useDeleteClassroom()` → `DELETE /classrooms/{id}`
- `useClassroomStudents()` → `GET /classrooms/{id}/students`
- `useAddStudent()` → `POST /classrooms/{id}/students/{childId}`
- `useRemoveStudent()` → `DELETE /classrooms/{id}/students/{childId}`
- `useClassroomChallenges()` → `GET /classrooms/{id}/challenges`
- `useCreateClassroomChallenge()` → `POST /classrooms/{id}/challenges`
- `useSchoolStudents()` → `GET /school/students`

#### Donations
- `useDonationCauses()` → `GET /donation-causes`
- `useCreateDonationCause()` → `POST /donation-causes`
- `useDonate()` → `POST /donations`
- `useMyDonations()` → `GET /donations`

#### Diary
- `useDiaryEntries()` → `GET /diary`
- `useCreateDiaryEntry()` → `POST /diary`
- `useUpdateDiaryEntry()` → `PATCH /diary/{id}`
- `useDeleteDiaryEntry()` → `DELETE /diary/{id}`

#### Budget Exceptions
- `useBudgetExceptions()` → `GET /wallets/budget-exceptions`
- `useCreateBudgetException()` → `POST /wallets/budget-exceptions`
- `useResolveBudgetException()` → `PATCH /wallets/budget-exceptions/{id}`

#### Partner Programs
- `usePartnerPrograms()` → `GET /partner-programs`
- `usePartnerData()` → `GET /partner-programs/{id}`
- `useCreateProgram()` → `POST /partner-programs`
- `useUpdateProgram()` → `PATCH /partner-programs/{id}`
- `useDeleteProgram()` → `DELETE /partner-programs/{id}`
- `useProgramInvitations()` → `GET /partner-programs/{id}/invitations`
- `useInviteToProgram()` → `POST /partner-programs/{id}/invite`
- `useAcceptProgramInvite()` → `POST /invite/program/{code}`

#### Profiles
- `useProfile()` → `GET /profiles/{id}`
- `useUpdateProfile()` → `PATCH /profiles/{id}`
- `useUploadAvatar()` → `POST /profiles/avatar`

#### Admin
- `useAdminStats()` → `GET /admin/stats`
- `useTenants()` (admin) → `GET /admin/tenants`
- `useCreateTenant()` → `POST /admin/tenants`
- `useUpdateTenant()` → `PATCH /admin/tenants/{id}`
- `useDeleteTenant()` → `DELETE /admin/tenants/{id}`
- `useAdminUsers()` → `GET /admin/users`
- `useUserRoles()` → `GET /admin/users/{userId}/roles`
- `useUpdateUserRoles()` → `PUT /admin/users/{userId}/roles`
- `useAuditLog()` → `GET /admin/audit-log`
- `useRiskFlags()` → `GET /admin/risk-flags`
- `useResolveRiskFlag()` → `PATCH /admin/risk-flags/{id}`
- `useLoginBanners()` → `GET /admin/login-banners`
- `useStoreLoginBanner()` → `POST /admin/login-banners`
- `useDeleteLoginBanner()` → `DELETE /admin/login-banners/{id}`
- `useOnboardingSteps()` → `GET /admin/onboarding-steps`
- `useUpdateOnboardingStep()` → `PUT /admin/onboarding-steps/{id}`
- `useExchangeRates()` → `GET /admin/exchange-rates`
- `useUpdateExchangeRate()` → `PUT /admin/exchange-rates/{id}`
- `useCurrencies()` → `GET /admin/currencies`

#### Outros
- `useMonthlySpending()` / `useMonthlysSummary()` → `GET /children/{id}/summary`
- `useEmissionStats()` / `useMoneySupply()` / `useWeeklySparkline()` → `GET /admin/stats`
- `useRegionalPrices()` → `GET /admin/exchange-rates`
- `useOnboarding()` → `GET /admin/onboarding-steps`
- `useTeenBudget()` → `GET /children/{id}/summary` + wallet
- `usePushNotifications()` / `useNativePush()` → manter lógica Capacitor existente (não usa Supabase)

### FASE 4 — Remover Supabase completamente

1. Reescrever `src/lib/notify.ts`:
   - Todas as funções helper (`notifyTaskCompleted`, `notifyTaskApproved`, etc.) devem chamar `POST /notifications` via `api.post()`
   - Remover lógica de `check_notification_throttle` e `notification_log` (throttle fica no backend)

2. Reescrever `src/lib/ledger-api.ts`:
   - `createTransaction()` → `POST /wallets/transactions` via `api.post()`

3. Eliminar `src/integrations/supabase/` (toda a pasta)

4. Remover `@supabase/supabase-js` do `package.json` e correr `npm install`

5. Remover variáveis de ambiente Supabase do `.env` e `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

6. Adicionar ao `.env` e `.env.example`:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```

---

## Convenções e padrões a seguir

### API Client — padrão de uso nos hooks
```typescript
import { api } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export function useChildren() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['children'],
    queryFn: () => api.get<ChildWithBalance[]>('/children'),
    enabled: !!user && user.role === 'parent',
  });
}
```

### Sem Supabase Realtime — usar polling
Substituir todos os `supabase.channel(...).on(...)` por `refetchInterval` no TanStack Query:
- Notifications: `refetchInterval: 30_000`
- Wallet balance: `refetchInterval: 15_000`
- Feature gate: `refetchInterval: 60_000`

### Tratamento de erros
```typescript
import { ApiError } from '@/lib/api-client';

// Em mutations, lançar como antes — o TanStack Query propaga
mutationFn: async (data) => {
  return api.post('/tasks', data);
  // ApiError tem: message (string), status (number), errors (object | null)
}
```

### X-Tenant-ID header
O api-client injeta automaticamente o `X-Tenant-ID` em todos os requests a partir de
`localStorage.getItem('kivara_tenant_id')`. O AuthContext deve guardar o `tenant_id`
do utilizador após login.

### Refresh de token automático
O api-client deve implementar a seguinte lógica:
1. Se `response.status === 401` → chama `POST /auth/refresh` com `{ refresh_token }`
2. Se refresh OK → guarda novo token → retenta request original
3. Se refresh falha → limpa `localStorage` → `window.location.href = '/login'`

---

## Ficheiros a NÃO modificar
- Componentes em `src/components/` (exceto se importarem Supabase diretamente)
- Páginas em `src/pages/` (exceto se importarem Supabase diretamente)
- `src/App.tsx`
- `tailwind.config.ts`, `vite.config.ts`, etc.
- `kiva-backend/` (backend já implementado e testado — 61/61 testes passando)

---

## Verificação final

Após completar todas as fases:

1. Correr `npx tsc --noEmit` na raiz do projeto — deve passar sem erros TypeScript
2. Correr `npm run build` — deve compilar sem erros
3. Confirmar que nenhum ficheiro em `src/` importa de `@supabase/supabase-js` ou `@/integrations/supabase/`
4. Confirmar que `package.json` não contém `@supabase/supabase-js`

---

## Informação técnica adicional

| Item | Detalhe |
|------|---------|
| JWT_SECRET | Já configurado no backend (`php artisan jwt:secret` executado) |
| Testes backend | 61/61 passando (`php artisan test` em `kiva-backend/`) |
| Spec da API | `openapi.yaml` na raiz — usar para shapes de request/response |
| Tenant ID | UUID que identifica a família/escola/parceiro do utilizador |
| Roles válidos | `parent`, `child`, `teen`, `teacher`, `admin`, `partner` |
| Child login | Username (não email) + PIN numérico de 6 dígitos |
| 2FA | Backend responde `requires_2fa: true` no login quando aplicável |
