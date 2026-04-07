# Plano de Migração — KIVARA API para Laravel
**Versão:** 1.1 — Todos os 32 problemas de `requisitos-kivara.md` cobertos  
**Objetivo:** Recriar toda a camada de backend (Supabase Auth + Edge Functions + RLS) numa API Laravel, mantendo o frontend React/TypeScript existente.

---

## 1. Decisões de Arquitectura

### 1.1 Stack Laravel

| Componente | Tecnologia | Justificativa |
|-----------|-----------|--------------|
| Framework | Laravel 11 | LTS, ecossistema maduro |
| Autenticação SPA | Laravel Sanctum | Cookie-based, seguro para SPA |
| Autenticação Mobile | JWT (tymon/jwt-auth) | Capacitor/mobile sem cookies |
| Base de Dados | PostgreSQL (mesma instância) | Reaproveitar schema existente |
| ORM | Eloquent + Laravel Query Builder | Produtividade + controlo |
| Permissões | spatie/laravel-permission | Substituir RLS com policies/gates |
| Multi-tenancy | stancl/tenancy (single-database) | Isolar dados por tenant |
| Filas (Jobs) | Laravel Horizon + Redis | Substituir Supabase cron/edge functions async |
| Real-time | Laravel Reverb (WebSocket nativo) | Substituir Supabase Realtime |
| Storage | Laravel Filesystem + S3/local | Substituir Supabase Storage |
| Cache | Redis | Sessões, rate-limiting, leaderboards |
| AI (LLM) | OpenAI PHP SDK / HTTP Client | Substituir edge functions de IA |
| TTS | ElevenLabs HTTP Client | Manter mesma API |
| Push Notifications | Laravel + Web Push (minishlink/web-push) + FCM | Substituir send-push-notification |
| Autenticação Biométrica | laragear/webauthn | WebAuthn server-side (problema #23) |
| Email | Laravel Mail + Mailgun/SMTP | Notificações por email (em falta actualmente — problema #14) |
| Logs / Auditoria | spatie/laravel-activitylog | Substituir audit_logs triggers |
| Testes | Pest PHP | Testes de feature e unit |
| Documentação API | Scribe (knuckleswtf/scribe) | OpenAPI/Swagger automático |

### 1.2 Estratégia de Multi-tenancy

O sistema tem 3 tipos de tenant (`family`, `school`, `institutional_partner`).  
Usar **single-database, multi-tenancy via `tenant_id`** coluna — sem separação de schemas.  
`stancl/tenancy` gere a resolução do tenant por subdomain ou header `X-Tenant-ID`.

```
kivara.app                   → Admin (sem tenant)
{slug}.kivara.app            → Tenant específico
Header: X-Tenant-ID: uuid    → Alternativa para mobile
```

**Resolução do problema #9 — `tenant_id` vs `school_tenant_id`:**  
No Supabase, `profiles` tinha dois campos confusos: `tenant_id` e `school_tenant_id`. Na API Laravel, a regra é simples:

| Role | `profiles.tenant_id` aponta para |
|------|----------------------------------|
| `parent` | tenant do tipo `family` |
| `teacher` | tenant do tipo `school` |
| `partner` | tenant do tipo `institutional_partner` |
| `admin` | nulo (acesso global) |
| `child` / `teen` | nulo — usa `children.school_tenant_id` para ligação a escola |

`school_tenant_id` em `profiles` é **eliminado**. Professores usam o seu `tenant_id` (que é a escola). Apenas a tabela `children` mantém `school_tenant_id` para associação opcional a uma escola.

### 1.3 Substituição do Supabase RLS

| Supabase RLS | Equivalente Laravel |
|-------------|-------------------|
| Row-level policies | Eloquent Global Scopes + Gates |
| `auth.uid()` | `auth()->id()` |
| `select` policy | Policy `viewAny` / `view` |
| `insert` policy | Policy `create` |
| `update` policy | Policy `update` |
| `delete` policy | Policy `delete` |

---

## 2. Estrutura do Projecto Laravel

```
kivara-api/
├── app/
│   ├── Console/Commands/          ← Comandos artisan
│   ├── Domains/                   ← Lógica de domínio (DDD light)
│   │   ├── Auth/
│   │   ├── Children/
│   │   ├── Wallet/
│   │   ├── Tasks/
│   │   ├── Missions/
│   │   ├── Vaults/
│   │   ├── Gamification/
│   │   ├── School/
│   │   ├── Notifications/
│   │   ├── Subscriptions/
│   │   ├── Partners/
│   │   └── Admin/
│   ├── Http/
│   │   ├── Controllers/Api/v1/    ← Controllers REST
│   │   ├── Middleware/            ← Auth, tenant, rate-limit, 2FA
│   │   └── Requests/              ← Form Request validation
│   ├── Jobs/                      ← Filas async (substituem edge functions cron)
│   ├── Events/                    ← Eventos do domínio
│   ├── Listeners/                 ← Listeners (notificações, audit log, badges)
│   ├── Models/                    ← Eloquent models
│   ├── Policies/                  ← Autorização (substituem RLS)
│   ├── Services/                  ← Serviços de negócio
│   └── Observers/                 ← Observers (substituem triggers PostgreSQL)
├── config/
├── database/
│   ├── migrations/                ← Adaptar migrações Supabase
│   └── seeders/
├── routes/
│   ├── api.php                    ← Rotas da API v1
│   └── channels.php               ← Canais WebSocket (Reverb)
└── tests/
    ├── Feature/
    └── Unit/
```

---

## 3. Mapeamento: Edge Functions → Laravel

### 3.1 Controllers / Services (chamadas síncronas)

| Edge Function (Supabase) | Laravel Equivalente |
|--------------------------|---------------------|
| `create-child-account` | `POST /api/v1/children` → `ChildController@store` + `CreateChildService` |
| `create-transaction` | `POST /api/v1/wallet/transactions` → `WalletController@createTransaction` + DB Transaction |
| `vault-deposit` | `POST /api/v1/vaults/{id}/deposit` → `VaultController@deposit` |
| `vault-withdraw` | `POST /api/v1/vaults/{id}/withdraw` → `VaultController@withdraw` |
| `complete-mission` | `POST /api/v1/missions/{id}/complete` → `MissionController@complete` |
| `complete-challenge` | `POST /api/v1/challenges/{id}/complete` → `ChallengeController@complete` |
| `claim-reward` | `POST /api/v1/rewards/{id}/claim` → `RewardController@claim` |
| `resolve-budget-exception` | `PATCH /api/v1/budget-exceptions/{id}` → `BudgetExceptionController@resolve` |
| `upgrade-subscription` | `POST /api/v1/subscriptions/upgrade` → `SubscriptionController@upgrade` |
| `add-extra-child-slot` | `POST /api/v1/subscriptions/extra-slot` → `SubscriptionController@addSlot` |
| `invite-guardian` | `POST /api/v1/households/guardians/invite` → `GuardianController@invite` |
| `claim-referral` | `POST /api/v1/referrals/claim` → `ReferralController@claim` |
| `verify-2fa` | `POST /api/v1/auth/2fa/verify` → `TwoFactorController@verify` |
| `auth-guard` | Middleware `ThrottleLogin` + `AuditAuthEvents` |
| `export-user-data` | `POST /api/v1/gdpr/export` → `GdprController@export` (Job async) |
| `anonymize-user-data` | `POST /api/v1/gdpr/delete` → `GdprController@anonymize` (Job async) |
| `wallet-admin` | `POST /api/v1/admin/wallet` → `AdminWalletController` |
| `generate-vapid-keys` | `GET /api/v1/push/vapid-key` → `PushController@vapidKey` |

### 3.2 Jobs / Filas (chamadas assíncronas / cron)

| Edge Function (Supabase) | Laravel Job | Schedule |
|--------------------------|-------------|----------|
| `process-allowances` | `ProcessAllowancesJob` | Diário (00:00) |
| `vault-interest` | `ApplyVaultInterestJob` | Mensal (1º dia) |
| `process-billing` | `ProcessBillingJob` | Mensal (1º dia) |
| `generate-missions` | `GenerateMissionsJob` | Semanal (2ª feira) |
| `generate-recurring-tasks` | `GenerateRecurringTasksJob` | Semanal (2ª feira) |
| `generate-insights` | `GenerateInsightsJob` | Diário (06:00) |
| `weekly-summary` | `SendWeeklySummaryJob` | Semanal (Dom 20:00) |
| `notification-engine` | `DispatchNotificationJob` | Triggered por eventos |
| `send-push-notification` | `SendPushNotificationJob` | Triggered por eventos |
| `risk-scan` | `RiskScanJob` | A cada transação + diário |
| `seed-test-accounts` | `SeedTestAccountsJob` | Manual (artisan) |

### 3.3 AI / LLM Services (chamadas externas)

| Edge Function (Supabase) | Laravel Service |
|--------------------------|-----------------|
| `suggest-missions` | `AiMissionSuggestionService` |
| `suggest-tasks` | `AiTaskSuggestionService` |
| `suggest-rewards` | `AiRewardSuggestionService` |
| `generate-lesson` | `AiLessonGeneratorService` |
| `generate-insights` | `AiInsightService` |
| `elevenlabs-tts` | `ElevenLabsTtsService` |

Todos passam por `RateLimiter::attempt('ai:'.$userId, 10, ...)` — máximo 10 chamadas IA/hora por utilizador.

---

## 4. Modelo de Autenticação

### 4.1 Adultos (parent / teacher / partner / admin)

```
POST /api/v1/auth/login
  → Valida email + password
  → Sanctum: emite cookie (SPA) ou token Bearer (mobile)
  → Se role tem 2FA obrigatório (parent, admin): retorna { requires_2fa: true }
  → POST /api/v1/auth/2fa/verify → emite sessão completa

GET /api/v1/auth/me → perfil + roles + tenant + currentChild
POST /api/v1/auth/logout
POST /api/v1/auth/register
```

### 4.2 Crianças / Adolescentes (child / teen)

Login especial via username + PIN — não usa email:

```
POST /api/v1/auth/child-login
  Body: { username: string, pin: string, household_id: uuid }
  → Valida PIN com hash bcrypt contra children.pin_hash
  → Emite token Bearer de curta duração (24h)
  → Rate-limit: 5 tentativas por household
```

> **Nota:** Diferentemente do Supabase, o PIN não é enviado para `auth.users`. O Laravel valida directamente contra `children.pin_hash` sem criar um utilizador Auth separado. Muito mais seguro.

### 4.3 Middleware Stack

```
api.php rotas:

Route::middleware(['api', 'tenant.resolve'])->group(function () {

  // Rotas públicas
  POST /auth/login, /auth/register, /auth/child-login

  // Rotas autenticadas
  Route::middleware(['auth:sanctum', 'idle.timeout', 'audit.requests'])->group(...)

  // Rotas com 2FA obrigatório
  Route::middleware(['auth:sanctum', '2fa.verified'])->group(...)

  // Rotas de admin
  Route::middleware(['auth:sanctum', 'role:admin'])->group(...)
})
```

### 4.4 Idle Timeout (substituir lógica do AuthContext)

Middleware `IdleTimeoutMiddleware`:
- Parent: 30 min sem actividade → 401 com `{ reason: 'idle_timeout' }`
- Admin: 15 min → 401
- Child/Teen: sem timeout (sessão 24h)

---

## 5. Domínios e APIs — Detalhe por Módulo

### Módulo 1 — Auth & Perfis

```
POST   /auth/register
POST   /auth/login
POST   /auth/child-login
POST   /auth/logout
GET    /auth/me
PATCH  /auth/me

POST   /auth/2fa/enable
POST   /auth/2fa/verify                    ← rate-limit: bloqueia após 5 tentativas (problema #24)
DELETE /auth/2fa/disable

POST   /auth/trusted-device                ← associado a fingerprint do dispositivo + expiração 30d (problema #10)
GET    /auth/devices
DELETE /auth/devices/{id}

POST   /auth/webauthn/register             ← biometric server-side (problema #23)
POST   /auth/webauthn/authenticate
GET    /auth/webauthn/credentials
DELETE /auth/webauthn/credentials/{id}

POST   /auth/password/reset
```

**Regras de segurança:**
- 2FA bloqueado após 5 tentativas falhadas; desbloqueia passados 15 min; regista em `auth_events`
- `trusted-device` token associado a fingerprint do browser/dispositivo; expiração de 30 dias
- WebAuthn usa `laragear/webauthn`; credenciais armazenadas em `webauthn_credentials` table; audit trail em `audit_logs`
- `date_of_birth` **nunca exposto** na API; retornar apenas `age_group` (`child`|`teen`) — protecção COPPA/RGPD (problema #22)

**Observadores:** `UserObserver` → regista em `audit_logs` on create/update/delete.

---

### Módulo 2 — Households & Children

```
GET    /households/me
PATCH  /households/me

GET    /households/me/guardians
POST   /households/guardians/invite        ← substitui invite-guardian
PATCH  /households/me/guardians/{id}       ← actualizar permission_level do co-encarregado (problema #6)
DELETE /households/me/guardians/{id}

GET    /children
POST   /children                           ← substitui create-child-account
GET    /children/{id}
PATCH  /children/{id}                      ← inclui school_tenant_id para associar a escola (problema #8)
DELETE /children/{id}

POST   /children/{id}/switch               ← seleccionar filho activo (currentChildId)
POST   /children/{id}/transfer             ← iniciar transferência para outro encarregado (problema #30)
POST   /children/{id}/transfer/accept      ← novo encarregado aceita (ambos devem aprovar)
POST   /children/{id}/transfer/cancel      ← cancelar transferência
```

**Regras de negócio críticas:**
- `POST /children`: verifica limite do tier de subscrição **no backend** antes de criar
- Atribui role `child` (< 13 anos) ou `teen` (≥ 13 anos) com base em `date_of_birth` — problema #1 resolvido
- `date_of_birth` armazenado encriptado; API retorna apenas `age_group`
- Cria `wallet` e `allowance_config` por defeito na mesma transacção DB
- `school_tenant_id` pode ser passado na criação ou actualizado via `PATCH /children/{id}` — problema #8 resolvido

**Permissões de co-encarregado** (problema #6):

| `permission_level` | Pode ler | Aprovar tarefas | Gerir filhos | Gestão financeira |
|--------------------|----------|-----------------|-------------|-------------------|
| `read_only` | ✅ | ❌ | ❌ | ❌ |
| `can_approve_tasks` | ✅ | ✅ | ❌ | ❌ |
| `full_access` | ✅ | ✅ | ✅ | ✅ |

**Modelo de consenso multi-encarregado** (problema #32):  
- Encarregado primário (criador do household) tem **veto** — pode reverter qualquer aprovação
- Co-encarregados com `full_access` podem aprovar; encarregado primário recebe notificação
- Conflito de aprovação: última acção ganha, mas ambos são notificados

---

### Módulo 3 — Wallet & Transacções

```
GET    /wallet                             ← saldo calculado do ledger
GET    /wallet/transactions
POST   /wallet/transactions                ← substitui create-transaction

GET    /wallet/budget-exceptions
POST   /wallet/budget-exceptions           ← teen pede excepção
PATCH  /wallet/budget-exceptions/{id}      ← substitui resolve-budget-exception
```

**Regra crítica:** `POST /wallet/transactions` usa `DB::transaction()` com `lockForUpdate()` na row da wallet para evitar race conditions. O saldo é recalculado do ledger e nunca do campo `balance`.

---

### Módulo 4 — Tasks

```
GET    /tasks
POST   /tasks
GET    /tasks/{id}
PATCH  /tasks/{id}
DELETE /tasks/{id}
POST   /tasks/{id}/approve
POST   /tasks/{id}/reject
POST   /tasks/suggest                      ← substitui suggest-tasks (AI)
POST   /tasks/recurring/generate           ← manual trigger (artisan job)
```

**Regra de aprovação atómica** (problema #16):  
`POST /tasks/{id}/approve` usa `DB::transaction()`:
1. Actualiza `tasks.status = 'approved'`
2. Cria `ledger_entries` (crédito na wallet da criança)
3. Cria `kiva_points_log` (pontos ganhos)  
Se qualquer passo falhar, toda a operação reverte.

---

### Módulo 5 — Missions

```
GET    /missions
POST   /missions
GET    /missions/{id}
POST   /missions/{id}/complete             ← substitui complete-mission
POST   /missions/suggest                   ← substitui suggest-missions (AI)
GET    /mission-templates                  ← admin
POST   /mission-templates
```

---

### Módulo 6 — Savings Vaults & Dream Vaults

```
GET    /vaults
POST   /vaults
GET    /vaults/{id}
PATCH  /vaults/{id}
DELETE /vaults/{id}
POST   /vaults/{id}/deposit                ← substitui vault-deposit
POST   /vaults/{id}/withdraw              ← substitui vault-withdraw
GET    /vaults/{id}/interest-history

GET    /dream-vaults
POST   /dream-vaults
GET    /dream-vaults/{id}
PATCH  /dream-vaults/{id}
DELETE /dream-vaults/{id}
POST   /dream-vaults/{id}/contribute       ← contribuição parental
GET    /dream-vaults/{id}/comments
POST   /dream-vaults/{id}/comments
```

---

### Módulo 7 — Rewards & Store

```
GET    /rewards
POST   /rewards                            ← parent cria
PATCH  /rewards/{id}
DELETE /rewards/{id}
POST   /rewards/{id}/claim                 ← substitui claim-reward
GET    /rewards/suggest                    ← substitui suggest-rewards (AI)
```

---

### Módulo 8 — Gamificação (Badges, Streaks, Kiva Points, Níveis)

```
GET    /badges
GET    /badges/progress
GET    /streaks
POST   /streaks/activity                   ← substitui use-record-daily-activity (UPSERT por dia)
GET    /kiva-points
GET    /kiva-points/log
GET    /leaderboard/household
GET    /leaderboard/classroom/{id}         ← respeita ranking_visibility do perfil (problema #19)
```

**Observadores:**
- `MissionCompletedEvent` → `AwardKivaPointsListener` → `UpdateLevelListener` → `CheckBadgeUnlockListener`
- `TaskApprovedEvent` → `AwardKivaPointsListener` + `LedgerEntryCreatedListener` (atómicos)
- `StreakUpdatedEvent` → `CheckStreakMilestoneListener`

**Badge unlock automático** (problema #20):  
`badges.unlock_condition` armazenado como JSON estruturado executável:
```json
{ "type": "task_count", "value": 10 }
{ "type": "streak_days", "value": 7 }
{ "type": "kiva_points", "value": 500 }
{ "type": "vault_saved_amount", "value": 100 }
{ "type": "missions_completed", "value": 5 }
```
`CheckBadgeUnlockListener` avalia estas condições automaticamente após cada evento relevante — sem desbloqueio manual.

**Distinção child vs teen na gamificação** (problema em §8 dos requisitos):  
API retorna gamificação filtrada por `age_group`:
- `child`: achievements, ranking, loja, diário
- `teen`: analytics, sem ranking público (mais focado em autonomia)

---

### Módulo 9 — Allowances

```
GET    /allowances
POST   /allowances
PATCH  /allowances/{id}
DELETE /allowances/{id}
POST   /allowances/process                 ← manual trigger (admin/artisan)
```

**Job:** `ProcessAllowancesJob` corre diariamente e verifica `allowance_configs` com `next_payment_at <= now()`.

---

### Módulo 10 — Schools & Classrooms

```
GET    /schools                            ← lista pública para registo de professor
GET    /schools/{id}
GET    /schools/{id}/stats

PATCH  /teachers/me/school                 ← professor altera escola (problema #5)
                                           ← requer validação: escola existe + conta activa

GET    /classrooms
POST   /classrooms
GET    /classrooms/{id}
PATCH  /classrooms/{id}
DELETE /classrooms/{id}
GET    /classrooms/{id}/students
POST   /classrooms/{id}/students/{childId}
DELETE /classrooms/{id}/students/{childId}

GET    /school/students                    ← alunos da escola do professor
                                           ← query: children WHERE school_tenant_id = teacher.tenant_id
                                           ← (problema #2 resolvido — não usa profiles.school_tenant_id)
```

---

### Módulo 11 — Challenges (Weekly & Collective)

```
GET    /challenges/weekly
GET    /challenges/collective
POST   /challenges/collective              ← professor cria
POST   /challenges/{id}/complete          ← substitui complete-challenge
GET    /challenges/{id}/leaderboard
```

---

### Módulo 12 — Lessons & Learning

```
GET    /lessons
GET    /lessons/{id}
POST   /lessons                            ← admin cria; valida schema JSON dos blocks/quiz
PATCH  /lessons/{id}                       ← guarda versão anterior em lesson_versions (problema #27)
DELETE /lessons/{id}
POST   /lessons/generate                   ← substitui generate-lesson (AI)
GET    /lessons/{id}/progress
POST   /lessons/{id}/progress
POST   /lessons/{id}/tts                   ← substitui elevenlabs-tts
GET    /lessons/{id}/versions              ← histórico de versões
```

**Validação de schema de lições** (problema #27):  
`POST /lessons` e `PATCH /lessons/{id}` passam por `LessonBlockRequest` que valida:
- `blocks[]` → cada bloco deve ter `type` em `['text','tip','example','highlight','image','video']`
- `quiz[]` → cada questão deve ter `question`, `options[]` (≥ 2), `correct_index`
- Antes de cada `PATCH`, a versão actual é copiada para `lesson_versions` (rollback possível)

---

### Módulo 13 — Notifications

```
GET    /notifications
PATCH  /notifications/{id}/read
POST   /notifications/mark-all-read
DELETE /notifications/{id}

POST   /push/subscribe                     ← regista device token
DELETE /push/subscribe
GET    /push/vapid-key                     ← substitui generate-vapid-keys

GET    /email/preferences                  ← configurar notificações por email (problema #14)
PATCH  /email/preferences
```

**Eventos que disparam email** (problema #14):

| Evento | Destinatário | Canal |
|--------|-------------|-------|
| Tarefa aprovada | Criança | Push + In-app |
| Tarefa pendente (24h) | Encarregado | Push + Email |
| Mesada paga | Criança | Push + In-app |
| Resumo semanal | Encarregado | Email |
| Excepção de orçamento (teen) | Encarregado | Push + Email |
| Convite de co-encarregado | Novo encarregado | Email |
| Convite de parceiro | Família/Escola | Email |
| Alerta de risco | Admin | Email |
| Exportação RGPD pronta | Utilizador | Email |

**Canais Reverb (WebSocket):**
```
private-user.{userId}          ← notificações in-app em tempo real
private-household.{householdId} ← actualizações familiares (balance, tasks)
private-classroom.{classroomId} ← actualizações da turma
```

---

### Módulo 14 — Tenants & Subscriptions

```
GET    /tenants                            ← admin
POST   /tenants                            ← admin
GET    /tenants/{id}
PATCH  /tenants/{id}
DELETE /tenants/{id}

GET    /subscription
GET    /subscription/tiers
POST   /subscription/upgrade              ← substitui upgrade-subscription
POST   /subscription/extra-slot           ← substitui add-extra-child-slot
GET    /subscription/invoices

POST   /referrals/claim                    ← substitui claim-referral
```

---

### Módulo 15 — Partners & Programs

```
GET    /programs
POST   /programs
GET    /programs/{id}
PATCH  /programs/{id}
GET    /programs/{id}/invitations
POST   /programs/{id}/invite

POST   /invite/program/{code}             ← família/escola aceita convite
```

---

### Módulo 16 — Admin

```
GET    /admin/stats
GET    /admin/users
GET    /admin/audit-log
GET    /admin/risk-flags
PATCH  /admin/risk-flags/{id}

GET    /admin/currencies
POST   /admin/currencies
GET    /admin/exchange-rates
PATCH  /admin/exchange-rates/{id}

GET    /admin/banners
POST   /admin/banners
PATCH  /admin/banners/{id}
DELETE /admin/banners/{id}

GET    /admin/onboarding-steps
POST   /admin/onboarding-steps
POST   /admin/notifications/broadcast
POST   /admin/wallet/emit                  ← emissão de KVC (wallet-admin)

POST   /admin/risk-scan                    ← substitui risk-scan manual

GET    /currencies/active                  ← moeda activa do tenant (problema #29)
```

**Símbolo de moeda dinâmico** (problema #29):  
- `GET /currencies/active` retorna a moeda configurada no tenant actual
- Frontend lê o símbolo deste endpoint; nunca usa "KVC" hardcoded
- Configurado em `tenants.active_currency_id → currencies.symbol`

---

### Módulo 17 — GDPR

```
POST   /gdpr/export                        ← substitui export-user-data (Job)
GET    /gdpr/export/status
GET    /gdpr/export/download/{token}       ← link expira em 1h; ficheiro encriptado AES-256 (problema #25)
POST   /gdpr/delete                        ← substitui anonymize-user-data (Job)
GET    /gdpr/consent
POST   /gdpr/consent
DELETE /gdpr/consent                       ← revogação em cascata (problema #26)
```

**Exportação RGPD segura** (problema #25):  
- Export gerado pelo `ExportUserDataJob` em background
- Ficheiro encriptado com AES-256 usando chave derivada do email do utilizador
- Armazenado em storage privado; token de acesso gerado com expiração de 1 hora
- Ficheiro apagado automaticamente após download ou expiração

**Revogação de consentimento em cascata** (problema #26):  
`DELETE /gdpr/consent` dispara `AnonymizeUserDataJob` que:
1. Anonimiza: nome → "Utilizador Anónimo", email → hash, DOB → nulo
2. Elimina: `diary_entries`, `push_subscriptions`, `webauthn_credentials`
3. Elimina: `ledger_entries` com mais de 90 dias (mantém aggregados)
4. Preserva: totais agregados anonimizados para estatísticas da plataforma
5. Desactiva conta: `profiles.is_active = false`

---

### Módulo 18 — Miscelânea

```
GET    /diary-entries                      ← child
POST   /diary-entries
PATCH  /diary-entries/{id}
DELETE /diary-entries/{id}

GET    /donations
POST   /donations

GET    /insights                           ← substitui generate-insights
POST   /insights/generate                 ← manual trigger
```

---

## 6. Migração da Base de Dados

### 6.1 Estratégia

Manter o mesmo PostgreSQL. As migrações Supabase existentes são a base.  
Adaptar para Laravel:
- Remover funções/triggers específicos do Supabase Auth (`handle_new_user`, etc.)
- Remover políticas RLS (serão substituídas por Eloquent Policies)
- Adicionar colunas em falta (identificadas nos requisitos)

### 6.2 Novas Colunas / Tabelas (correções dos requisitos)

```sql
-- Problema #1: diferenciação child/teen
ALTER TABLE children ADD COLUMN age_group TEXT GENERATED ALWAYS AS (
  CASE WHEN date_of_birth IS NOT NULL AND
    EXTRACT(YEAR FROM AGE(date_of_birth)) >= 13 THEN 'teen' ELSE 'child' END
) STORED;

-- Problema #10: PIN com hash (não mais via Supabase Auth)
ALTER TABLE children ADD COLUMN pin_hash TEXT;

-- Problema #15: KivaPoints cacheados (evitar queries O(n) nos leaderboards)
ALTER TABLE profiles ADD COLUMN kiva_points_total INTEGER DEFAULT 0;

-- Problema #13: ano letivo nas turmas
ALTER TABLE classrooms ADD COLUMN academic_year TEXT NOT NULL DEFAULT '2025/2026';

-- Problema #19: visibilidade no ranking (RGPD)
ALTER TABLE profiles ADD COLUMN ranking_visibility TEXT DEFAULT 'private'
  CHECK (ranking_visibility IN ('private', 'classmates', 'household'));

-- Problema #6: permissões do co-encarregado
ALTER TABLE household_guardians ADD COLUMN permission_level TEXT DEFAULT 'read_only'
  CHECK (permission_level IN ('read_only', 'can_approve_tasks', 'full_access'));

-- Problema #9: eliminar school_tenant_id de profiles (unificação tenant)
-- profiles.tenant_id é o único campo de tenant (para teachers aponta para a escola)
ALTER TABLE profiles DROP COLUMN IF EXISTS school_tenant_id;

-- Problema #22: DOB encriptado; API expõe apenas age_group
ALTER TABLE children ADD COLUMN date_of_birth_encrypted BYTEA;
-- date_of_birth original pode ser mantido internamente para cálculo mas nunca exposto na API

-- Problema #27: versões de lições
CREATE TABLE lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  blocks JSONB NOT NULL,
  quiz JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Problema #18: idempotência em tarefas recorrentes
ALTER TABLE tasks ADD COLUMN recurrence_period TEXT;
CREATE UNIQUE INDEX tasks_recurrence_idx ON tasks(recurrence_source_id, recurrence_period)
  WHERE recurrence_source_id IS NOT NULL;

-- Problema #21: streaks sem duplicados
CREATE UNIQUE INDEX streak_daily_idx ON streak_activities(profile_id, active_date);

-- Problema #20: badge unlock automático com condições executáveis
ALTER TABLE badges ADD COLUMN unlock_condition JSONB;
-- Formato: { "type": "task_count", "value": 10 }

-- Problema #23: credenciais biométricas (WebAuthn)
CREATE TABLE webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  device_name TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Problema #25: tokens de exportação RGPD
CREATE TABLE gdpr_export_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  file_path TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Problema #29: moeda activa por tenant
ALTER TABLE tenants ADD COLUMN active_currency_id UUID REFERENCES currencies(id);

-- Problema #30: transferência de criança entre encarregados
CREATE TABLE child_transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id),
  from_household_id UUID REFERENCES households(id),
  to_guardian_email TEXT NOT NULL,
  to_household_id UUID REFERENCES households(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
```

---

## 7. Substituição do Supabase Client no Frontend

### 7.1 Estratégia

Criar um **wrapper de API** centralizado que substitui `@supabase/supabase-js`:

```
src/
├── lib/
│   ├── api.ts              ← Axios instance com interceptors (auth token, tenant)
│   └── api-client/
│       ├── auth.ts         ← Substituir supabase.auth.*
│       ├── children.ts     ← Substituir supabase.from('children')
│       ├── wallet.ts
│       ├── tasks.ts
│       ├── missions.ts
│       ├── vaults.ts
│       └── ...
├── hooks/                  ← Actualizar cada hook para usar api-client/*
│   └── (≈52 hooks para migrar — ver §7.4)
└── contexts/
    └── AuthContext.tsx     ← Substituir AuthContext para usar api.ts
```

**Actualização de tipos TypeScript** (problema #4):  
`src/types/kivara.ts` deve ser **reescrito** para reflectir a API Laravel:
- `Child.familyId` → `Child.householdId`
- `Child.pin` removido (nunca exposto pela API)
- `Teen.weeklySpendLimit` → `Teen.dailySpendLimit` + `Teen.monthlyBudget`
- `Classroom.studentIds: string[]` → removido (usar `GET /classrooms/{id}/students`)
- Adicionar `Child.ageGroup: 'child' | 'teen'` (calculado no backend)
- Adicionar `Guardian.permissionLevel: 'read_only' | 'can_approve_tasks' | 'full_access'`

### 7.2 AuthContext — Principais Mudanças

| Antes (Supabase) | Depois (Laravel) |
|-----------------|-----------------|
| `supabase.auth.signInWithPassword()` | `POST /api/v1/auth/login` |
| `supabase.auth.signOut()` | `POST /api/v1/auth/logout` |
| `supabase.auth.getUser()` | `GET /api/v1/auth/me` |
| `supabase.auth.onAuthStateChange()` | Polling ou WebSocket `private-user.{id}` |
| `supabase.from('profiles').select()` | `GET /api/v1/auth/me` (embutido) |
| `loginAsChild()` via synthetic email | `POST /api/v1/auth/child-login` |

### 7.3 Realtime — Principais Mudanças

| Antes (Supabase) | Depois (Laravel Reverb) |
|-----------------|------------------------|
| `supabase.channel('wallet').on('postgres_changes')` | `Echo.private('household.{id}').listen('.wallet.updated')` |
| `supabase.channel('notifications')` | `Echo.private('user.{id}').listen('.notification.created')` |
| `supabase.channel('tasks')` | `Echo.private('household.{id}').listen('.task.updated')` |

Instalar no frontend:
```bash
npm install laravel-echo pusher-js
```

### 7.4 Estratégia de Suporte Offline (problema #28)

O app é um PWA/Capacitor usado em mobile — conectividade intermitente é real.

**Abordagem:** Mutation queue no IndexedDB com sync automático:

```
src/lib/
├── offline-queue.ts        ← fila de mutations em IndexedDB (idb-keyval)
└── sync-manager.ts         ← escuta navigator.onLine; processa fila quando online
```

**Regras:**
- Leituras (GET): TanStack Query com `staleTime` generoso (5 min); dados cacheados servem offline
- Escritas (POST/PATCH/DELETE): se offline → adicionar à fila; quando online → processar por ordem
- Conflitos: o servidor tem prioridade; frontend recebe `409 Conflict` e resolve com "server wins"
- Operações financeiras (transactions, vault deposits): **não** enfileirar — mostrar erro claro ao utilizador se offline (dinheiro não pode ser processado sem confirmação server)

---

## 8. Fases de Implementação

### Fase 1 — Fundação (Semana 1-2)
**Objectivo:** Projecto Laravel funcional com autenticação completa

- [ ] Criar projecto Laravel 11 com Sanctum, Reverb, Horizon
- [ ] Configurar PostgreSQL (mesma DB ou separada para dev)
- [ ] Migrations base: `profiles`, `user_roles`, `households`, `children`, `wallets`
- [ ] `AuthController`: register, login, logout, me, child-login
- [ ] `TwoFactorController`: enable, verify, disable — **rate-limit 5 tentativas + lockout 15min** (problema #24)
- [ ] `WebAuthnController`: register, authenticate, credentials (problema #23)
- [ ] Middleware: `TenantResolve`, `IdleTimeout`, `TwoFactorVerified`, `ThrottleLogin`
- [ ] `UserObserver` → `audit_logs`
- [ ] `date_of_birth` nunca exposto na API; retornar apenas `age_group` (problema #22)
- [ ] Testes: autenticação adulto, autenticação criança, 2FA lockout, WebAuthn, idle timeout

### Fase 2 — Household & Children (Semana 3)
**Objectivo:** Criar e gerir filhos com role correcto

- [ ] `ChildController`: CRUD + `CreateChildService`
- [ ] Lógica `child` vs `teen` via `date_of_birth` — atribuição automática de role (problema #1)
- [ ] Verificação de limite de subscrição no backend apenas (problema #7)
- [ ] `school_tenant_id` associável na criação e via PATCH (problema #8)
- [ ] `GuardianController`: invite + list + remove + **actualizar permission_level** (problema #6)
- [ ] `ChildTransferController`: iniciar + aceitar + cancelar transferência (problema #30)
- [ ] Modelo de consenso: encarregado primário tem veto (problema #32)
- [ ] Testes: criação child < 13, teen ≥ 13, limite de filhos, transferência, permissões co-encarregado

### Fase 3 — Wallet & Transacções (Semana 4)
**Objectivo:** Operações financeiras atómicas e correctas

- [ ] `WalletController`: saldo calculado do ledger, histórico
- [ ] `TransactionService`: DB::transaction() + lockForUpdate()
- [ ] `BudgetExceptionController`: criar (teen) + resolver (parent)
- [ ] `ProcessAllowancesJob`
- [ ] Testes: race condition, limite de budget, exceção de orçamento

### Fase 4 — Tasks & Missions (Semana 5)
**Objectivo:** Tarefas e missões com aprovação e recompensas

- [ ] `TaskController`: CRUD + approve + reject
- [ ] `TaskApprovedEvent` → `LedgerEntryListener` + `KivaPointsListener` (atómicos)
- [ ] `MissionController`: CRUD + complete
- [ ] `GenerateMissionsJob`, `GenerateRecurringTasksJob`
- [ ] `AiTaskSuggestionService`, `AiMissionSuggestionService`
- [ ] Testes: aprovação atómica, geração idempotente

### Fase 5 — Vaults & Rewards (Semana 6)
**Objectivo:** Cofrinhos com juros e recompensas

- [ ] `VaultController`: deposit, withdraw com DB transaction
- [ ] `DreamVaultController`: contribuição parental, comentários
- [ ] `ApplyVaultInterestJob` (mensal)
- [ ] `RewardController`: create (parent) + claim (child)
- [ ] Testes: depósito/levantamento, juros, resgate de recompensa

### Fase 6 — Gamificação (Semana 7)
**Objectivo:** Badges, streaks, níveis e leaderboards

- [ ] `BadgeController`, `StreakController`, `KivaPointsController`
- [ ] `CheckBadgeUnlockListener` — avalia `badges.unlock_condition` JSON (problema #20)
- [ ] `UpdateLevelListener` (recalcular nível ao ganhar pontos)
- [ ] `LeaderboardController` com Redis cache + respeitar `ranking_visibility` (problema #19)
- [ ] Constraint `UNIQUE(profile_id, active_date)` em streaks + UPSERT (problema #21)
- [ ] Testes: unlock automático de badge, progressão de nível, streak consecutivo, ranking privado

### Fase 7 — Escola & Turmas (Semana 8)
**Objectivo:** Módulo escolar com alunos correctamente ligados

- [ ] `SchoolController` (público: lista escolas; privado: stats)
- [ ] `ClassroomController`: CRUD + gerir alunos + `academic_year` (problema #13)
- [ ] Fix query alunos: `children WHERE school_tenant_id = teacher.tenant_id` (problema #2)
- [ ] `PATCH /teachers/me/school` — professor pode alterar escola (problema #5)
- [ ] `ChallengeController`: weekly + collective (professor)
- [ ] Testes: professor cria turma, adiciona alunos, muda escola, desafio colectivo

### Fase 8 — Notificações & Real-time (Semana 9)
**Objectivo:** Push, in-app, email e WebSocket

- [ ] `NotificationController`: list, read, delete
- [ ] `PushController`: subscribe, vapid-key
- [ ] `EmailPreferencesController`: configurar eventos por email (problema #14)
- [ ] `DispatchNotificationJob` com Laravel Notifications (in-app + push + email)
- [ ] Laravel Reverb configurado: canais `user`, `household`, `classroom`
- [ ] `SendWeeklySummaryJob` via email
- [ ] Testes: push enviada, notificação in-app, email de resumo, evento Reverb

### Fase 9 — Lessons, AI & TTS (Semana 10)
**Objectivo:** Conteúdo educativo com IA

- [ ] `LessonController`: CRUD + progress + versões (`lesson_versions`) (problema #27)
- [ ] `LessonBlockRequest`: validação de schema JSON dos blocks e quiz (problema #27)
- [ ] `AiLessonGeneratorService`, `AiInsightService`
- [ ] `ElevenLabsTtsService`
- [ ] Rate-limiter para chamadas IA (10/hora por utilizador) (problema #31)
- [ ] Testes: validação schema inválido rejeitado, geração de lição, rollback de versão, rate-limit, TTS

### Fase 10 — Subscriptions, Tenants & Partners (Semana 11)
**Objectivo:** Modelo de negócio, billing e moeda dinâmica

- [ ] `SubscriptionController`: tiers, upgrade, extra-slot, invoices
- [ ] `ProcessBillingJob` (mensal)
- [ ] `TenantController` (admin) — incluindo `active_currency_id` (problema #29)
- [ ] `CurrencyController`: `GET /currencies/active` por tenant (problema #29)
- [ ] `PartnerController`: programas + convites
- [ ] `ReferralController`
- [ ] Testes: upgrade de plano, convite de parceiro, billing, moeda dinâmica

### Fase 11 — Admin, RGPD & Segurança (Semana 12)
**Objectivo:** Ferramentas de administração e compliance

- [ ] `AdminController`: stats, users, currencies, banners, risk-flags, onboarding
- [ ] `GdprController`: export encriptado + link expiração 1h (problema #25)
- [ ] `GdprController`: delete com cascata completa (problema #26)
- [ ] `RiskScanJob`
- [ ] `AdminWalletController` (emissão de KVC)
- [ ] Testes: exportação RGPD encriptada, link expira, cascata de eliminação, risk-scan

### Fase 12 — Integração Frontend (Semana 13-14)
**Objectivo:** Frontend a consumir a nova API Laravel

- [ ] Criar `src/lib/api.ts` (Axios com interceptors)
- [ ] Criar `src/lib/api-client/auth.ts` — substituir `AuthContext`
- [ ] **Reescrever `src/types/kivara.ts`** para reflectir API Laravel (problema #4):
  - `Child.familyId` → `Child.householdId`; remover `Child.pin`; adicionar `Child.ageGroup`
  - `Guardian.permissionLevel`; `Classroom` sem `studentIds[]`
- [ ] Substituir cada hook de Supabase (~52 hooks) por hook que usa `api-client/`
- [ ] Configurar `laravel-echo` + Reverb no frontend
- [ ] Implementar `offline-queue.ts` + `sync-manager.ts` (problema #28)
- [ ] Frontend lê símbolo de moeda de `GET /currencies/active` — sem "KVC" hardcoded (problema #29)
- [ ] Remover `@supabase/supabase-js` do projecto
- [ ] Testes E2E: login, criar filho, transacção, notificação real-time, offline queue

### Fase 13 — QA, Performance & Deploy (Semana 15-16)
**Objectivo:** Produção estável

- [ ] Testes de carga (k6) nos endpoints críticos (wallet, transactions)
- [ ] Configurar Laravel Horizon para monitorização de filas
- [ ] Configurar rate-limiting global (60 req/min por IP, 300 req/min autenticado)
- [ ] Configurar CORS para domínios do frontend
- [ ] Docker Compose: laravel + postgres + redis + reverb
- [ ] CI/CD: GitHub Actions (Pest tests + deploy)
- [ ] Documentação API com Scribe

---

## 9. Dependências Laravel (composer.json)

```json
{
  "require": {
    "laravel/framework": "^11.0",
    "laravel/sanctum": "^4.0",
    "laravel/reverb": "^1.0",
    "laravel/horizon": "^5.0",
    "spatie/laravel-permission": "^6.0",
    "spatie/laravel-activitylog": "^4.0",
    "stancl/tenancy": "^3.0",
    "tymon/jwt-auth": "^2.0",
    "minishlink/web-push": "^9.0",
    "laragear/webauthn": "^3.0",
    "openai-php/laravel": "^0.10",
    "knuckleswtf/scribe": "^4.0",
    "predis/predis": "^2.0"
  },
  "require-dev": {
    "pestphp/pest": "^2.0",
    "pestphp/pest-plugin-laravel": "^2.0",
    "fakerphp/faker": "^1.23"
  }
}
```

---

## 10. Considerações de Compatibilidade Durante a Transição

Para uma migração **sem downtime**, pode existir um período de coexistência:

1. **Fase de coexistência:** Frontend continua a usar Supabase; nova API Laravel corre em paralelo
2. **Feature flags:** Cada módulo do frontend tem um flag `USE_LARAVEL_API=true/false` em `.env`
3. **Proxy reverso:** Nginx roteia `/api/v1/*` para Laravel, resto para Supabase
4. **Migração gradual por módulo:** Auth primeiro → depois wallet → depois resto
5. **Rollback:** Se módulo Laravel falha, feature flag retorna para Supabase

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Perda de dados na migração do schema | Média | Backups automáticos; testar em DB de staging primeiro |
| Supabase Realtime difícil de replicar | Alta | Laravel Reverb é nativo; migrar canal a canal |
| Performance de leaderboards sem cache | Alta | Redis cache com invalidação por evento |
| AI rate limits da OpenAI | Média | Implementar fila de prioridade + fallback para templates |
| Frontend com ~50 hooks para migrar | Alta | Script de cobertura automática; migrar por domínio |
| Sessões de criança sem Supabase Auth | Baixa | JWT próprio validado internamente; mais simples no fim |

---

## 12. Cobertura dos Problemas de `requisitos-kivara.md`

Tabela de rastreabilidade: todos os 32 problemas identificados e onde são resolvidos neste plano.

| # | Problema | Prioridade | Resolvido em |
|---|---------|-----------|-------------|
| 1 | Child vs Teen nunca diferenciados na criação | 🔴 Crítico | Módulo 2 + Fase 2 + DB §6.2 |
| 2 | `useSchoolStudents` busca professores, não alunos | 🔴 Crítico | Módulo 10 + Fase 7 |
| 3 | Saldo wallet pode dessincronizar | 🔴 Crítico | Módulo 3 (saldo calculado do ledger) |
| 4 | Modelo TypeScript `kivara.ts` desatualizado | 🟡 Importante | Fase 12 (reescrita de `kivara.ts`) + §7.1 |
| 5 | Professor não pode mudar de escola | 🟡 Importante | Módulo 10 `PATCH /teachers/me/school` + Fase 7 |
| 6 | Co-encarregados sem permissões definidas | 🟡 Importante | Módulo 2 `permission_level` + Fase 2 + DB §6.2 |
| 7 | Verificação de limites duplicada | 🟡 Importante | Fase 2 (backend only) + Módulo 2 |
| 8 | Fluxo de aluno em escola não definido | 🟡 Importante | Módulo 2 `PATCH /children/{id}` + Módulo 10 + Fase 2 |
| 9 | `tenant_id` vs `school_tenant_id` dualidade | 🟢 Melhoria | §1.2 (unificação tenant) + DB §6.2 (drop column) |
| 10 | PIN via Supabase Auth fraco | 🟢 Melhoria | §4.2 auth criança + DB §6.2 `pin_hash` |
| 11 | 34 Edge Functions fragmentadas | 🟢 Melhoria | §3 (consolidação em Controllers + Jobs) |
| 12 | Nível não sincronizado automaticamente | 🟢 Melhoria | Módulo 8 `UpdateLevelListener` + Fase 6 |
| 13 | Sem ano letivo nas turmas | 🟢 Melhoria | Módulo 10 + Fase 7 + DB §6.2 `academic_year` |
| 14 | Sem notificação por email | 🟢 Melhoria | Módulo 13 + Fase 8 + tabela de eventos |
| 15 | KivaPoints não persistidos na BD | 🔴 Crítico | Módulo 8 + DB §6.2 `kiva_points_total` |
| 16 | Race condition aprovação tarefa → ledger | 🔴 Crítico | Módulo 4 (DB::transaction atómica) + Fase 4 |
| 17 | Emissão parental não atómica | 🔴 Crítico | Módulo 3 `lockForUpdate()` + Fase 3 |
| 18 | Tarefas recorrentes não idempotentes | 🔴 Crítico | Módulo 4 + DB §6.2 `UNIQUE(recurrence_source_id, period)` |
| 19 | Rankings sem consentimento RGPD | 🟡 Importante | Módulo 8 `ranking_visibility` + DB §6.2 + Fase 6 |
| 20 | Desbloqueio de badges manual | 🟡 Importante | Módulo 8 `unlock_condition` JSON + DB §6.2 + Fase 6 |
| 21 | Streaks com duplicados | 🟡 Importante | DB §6.2 `UNIQUE(profile_id, active_date)` + Fase 6 |
| 22 | Date of birth sem encriptação (COPPA) | 🟡 Importante | §4.1 (DOB nunca exposto) + Módulo 1 + DB §6.2 |
| 23 | Biometric sem validação servidor | 🟡 Importante | Módulo 1 WebAuthn + Fase 1 + DB §6.2 `webauthn_credentials` |
| 24 | 2FA sem rate-limiting | 🟡 Importante | Módulo 1 (5 tentativas + lockout) + Fase 1 |
| 25 | Exportação RGPD não encriptada | 🟡 Importante | Módulo 17 (AES-256 + token expiração 1h) + Fase 11 |
| 26 | Revogação de consentimento incompleta | 🟡 Importante | Módulo 17 (cascata completa) + Fase 11 |
| 27 | Lições JSON sem validação de schema | 🟡 Importante | Módulo 12 `LessonBlockRequest` + `lesson_versions` + Fase 9 |
| 28 | Sem suporte offline | 🟢 Melhoria | §7.4 `offline-queue.ts` + `sync-manager.ts` + Fase 12 |
| 29 | Símbolo de moeda hardcoded | 🟢 Melhoria | Módulo 16 `GET /currencies/active` + Fase 10 + Fase 12 |
| 30 | Sem migração de conta entre encarregados | 🟢 Melhoria | Módulo 2 `child_transfer_requests` + DB §6.2 + Fase 2 |
| 31 | Rate limiting IA ausente | 🟢 Melhoria | §3.3 `RateLimiter::attempt` + Fase 9 |
| 32 | Multi-encarregado sem consenso | 🟢 Melhoria | Módulo 2 (veto encarregado primário) + Fase 2 |

**Total: 32/32 problemas cobertos** ✅

---

*Plano elaborado com base na análise completa do código-fonte em 2026-04-06.*
