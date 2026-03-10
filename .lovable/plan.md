

## Plano: Motor de Missões Inteligente — KIVARA

### Contexto actual

Já existe:
- Tabela `missions` (types: saving/budgeting/planning/custom, statuses: available/in_progress/completed)
- CRUD de missões pelos pais (`ParentMissions.tsx`)
- Visualização e interacção pelas crianças/teens
- Edge function `suggest-missions` com IA para sugestões
- Sistema de streaks, badges, notificações e desafios colectivos

O que falta para o motor inteligente: geração automática baseada em comportamento, novos tipos de missão, dificuldade progressiva, recompensas automáticas, agendamento, templates admin e analytics.

---

### Implementação em 4 fases

#### Fase 1 — Schema e tipos expandidos

| Acção | Detalhe |
|---|---|
| **Migração SQL** | Expandir enum `mission_type` com `learning`, `social`, `goal`, `daily`, `weekly`. Adicionar colunas à tabela `missions`: `difficulty` (enum: beginner/explorer/saver/strategist/master), `source` (enum: parent/engine/admin/teacher), `expires_at` (timestamptz), `is_auto_generated` (boolean). |
| **Nova tabela `mission_templates`** | `id`, `title`, `description`, `type`, `difficulty`, `reward_coins`, `reward_points`, `target_amount`, `conditions` (jsonb — regras de quando gerar), `is_active`, `created_by`, `created_at`. Templates reutilizáveis pelo motor e admin. |

#### Fase 2 — Edge Function `generate-missions` (Motor de Geração)

Nova edge function agendada que corre diariamente (07:00 UTC) e semanalmente (segunda 07:00):

1. **Recolhe dados comportamentais** por criança:
   - Saldo actual (wallet_balances)
   - Histórico de transacções recentes (ledger_entries — gastos vs poupanças)
   - Missões concluídas (contagem, tipos, dificuldade)
   - Streak actual
   - Lições concluídas (lesson_progress)
   - Frequência de acesso (streak_activities)
   - Metas de poupança (dream_vaults)

2. **Aplica regras de adaptação**:
   - Gasta muito → missão de poupança
   - Raramente abre a app → missão de re-engagement com bónus
   - Poupa consistentemente → missão avançada
   - Conclui muitas missões → aumentar dificuldade
   - Nunca fez quiz → missão de aprendizagem

3. **Chama IA** (Gemini Flash) com contexto comportamental para gerar missões personalizadas, evitando repetição (envia títulos das últimas 20 missões)

4. **Insere missões** na tabela com `source = 'engine'`, `is_auto_generated = true`, `expires_at` definido (24h para daily, 7d para weekly)

5. **Dispara notificação** "As tuas novas missões estão prontas! 🎯"

| Ficheiro | Acção |
|---|---|
| `supabase/functions/generate-missions/index.ts` | **Novo** — Motor de geração com análise comportamental + IA |
| `supabase/config.toml` | Registar função |
| Cron job (via insert SQL) | Agendar execução diária e semanal |

#### Fase 3 — Recompensas automáticas e validação

| Ficheiro | Acção |
|---|---|
| `supabase/functions/complete-mission/index.ts` | **Novo** — Valida conclusão, credita KVC e KivaPoints via ledger, actualiza badge progress, previne duplicados (idempotency_key) |
| `src/hooks/use-missions.ts` | `useCompleteMission` passa a chamar a edge function em vez de update directo, para garantir recompensa atómica |
| Validação | Missões de task requerem aprovação parental; missões de poupança verificam saldo real; missões de aprendizagem verificam lesson_progress |

#### Fase 4 — Admin Mission Control + Analytics + UI

| Ficheiro | Acção |
|---|---|
| `src/pages/admin/AdminMissions.tsx` | **Novo** — Painel com: gestão de templates CRUD, lançamento de missões sazonais/nacionais, ajuste de recompensas, analytics (taxa de conclusão, missões populares, engagement por idade) |
| `src/components/layouts/AdminLayout.tsx` | Adicionar link "Missões" ao nav |
| `src/App.tsx` | Registar rota `/admin/missions` |
| `src/pages/child/ChildMissions.tsx` | Separar missões auto-geradas (daily/weekly) das missões dos pais. Mostrar expiração com countdown. Mostrar nível de dificuldade com badge visual |
| `src/pages/parent/ParentDashboard.tsx` | Widget de progresso de missões dos filhos |

---

### Resumo de ficheiros

| Ficheiro | Acção |
|---|---|
| Migração SQL | Expandir enums, adicionar colunas, criar `mission_templates` |
| `supabase/functions/generate-missions/index.ts` | **Novo** — Motor de geração inteligente |
| `supabase/functions/complete-mission/index.ts` | **Novo** — Recompensa atómica com validação |
| `supabase/config.toml` | Registar novas funções |
| SQL insert (cron) | Agendar geração diária/semanal |
| `src/hooks/use-missions.ts` | Actualizar completeMission para usar edge function |
| `src/pages/admin/AdminMissions.tsx` | **Novo** — Painel admin de missões |
| `src/components/layouts/AdminLayout.tsx` | Nav link |
| `src/App.tsx` | Rota admin/missions |
| `src/pages/child/ChildMissions.tsx` | UI para daily/weekly com countdown e dificuldade |
| `src/i18n/pt.ts` + `src/i18n/en.ts` | Novas chaves de tradução |

### Segurança

- RLS na `mission_templates`: apenas admin pode CRUD
- `generate-missions` usa service_role_key internamente
- `complete-mission` valida que a criança é dona da missão, verifica duplicados, e usa transacção atómica no ledger
- Missões auto-geradas são pedagógicas e adequadas à idade (validado pelo prompt IA)

