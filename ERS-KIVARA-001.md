# ERS — Especificação de Requisitos de Software
## KIVARA — Plataforma de Literacia Financeira para Famílias e Escolas

| Campo | Valor |
|-------|-------|
| **Documento** | ERS-KIVARA-001 |
| **Versão** | 1.0 |
| **Data** | 06 de Abril de 2026 |
| **Estado** | Em revisão |
| **Classificação** | Interno — restrito à equipa de produto |

> **Como usar este documento:** Este é o documento de referência para decisões de produto, priorização de backlog e validação de requisitos. Os problemas arquitecturais identificados na Secção 12 devem ser tratados como dívida técnica e entrar no roadmap. Os Requisitos Funcionais (Secção 13) são a base para as histórias de utilizador.
>
> **Documento relacionado:** Com base neste ERS foi elaborado o **Plano de Migração para Laravel** (`plano-migracao-laravel.md`), que constitui o documento técnico de implementação dos passos seguintes. Todos os 32 problemas identificados neste ERS estão mapeados e resolvidos nesse plano (ver §12 — Cobertura dos Problemas). A equipa de engenharia deve consultar ambos os documentos em conjunto.

---

## 1. Visão Geral do Sistema

O KIVARA é uma plataforma de literacia financeira gamificada que permite a crianças e adolescentes aprenderem a gerir dinheiro virtual (KivaCoins — KVC) sob supervisão de encarregados de educação e professores. Inclui módulos para famílias, escolas e parceiros institucionais.

**Canais de entrega:** aplicação web progressiva (PWA) e aplicação móvel nativa (iOS e Android).

---

## 2. Atores / Perfis de Utilizador

### 2.1 Definição dos Perfis

| Perfil | Descrição | Como entra no sistema |
|--------|-----------|----------------------|
| **Encarregado** (`parent`) | Adulto responsável pela família | Registo self-service |
| **Criança** (`child`) | Utilizador com < 13 anos | Criado pelo encarregado |
| **Adolescente** (`teen`) | Utilizador com ≥ 13 anos | Criado pelo encarregado OU registo próprio com convite |
| **Professor** (`teacher`) | Docente associado a uma escola | Registo com selecção de escola obrigatória |
| **Parceiro** (`partner`) | Organização/empresa patrocinadora | Registo institucional |
| **Administrador** (`admin`) | Gestor da plataforma | Criado internamente |

### 2.2 Problemas Identificados nos Perfis

**PROBLEMA CRÍTICO:** A distinção `child` vs `teen` **não está implementada**.  
- A Edge Function `create-child-account` atribui **sempre** o role `'child'`, independentemente da `date_of_birth`.  
- O interface `Teen` em `kivara.ts` existe mas nunca é usado na criação.  
- **Requisito:** Se `date_of_birth` indicar ≥ 13 anos, o role deve ser `teen` automaticamente.

**PROBLEMA:** O modelo de dados `Child` e `Teen` em `src/types/kivara.ts` é diferente das tabelas reais da base de dados:
- `Child.pin`, `Child.username` não existem na tabela `children` (estão em `auth.users` e `profiles`)
- `Teen.weeklySpendLimit`, `Teen.spendingCategories` estão em `children.daily_spend_limit` e `children.monthly_budget` — não numa tabela separada
- **Requisito:** Unificar os tipos TypeScript com o esquema real da base de dados.

---

## 3. Modelo de Dados — Estado Atual e Proposta

### 3.1 Entidades Principais (Base de Dados Real)

```
auth.users                    ← Supabase Auth
  └── profiles                ← Dados de perfil (1:1 com auth.users)
        ├── user_roles        ← Role(s) do utilizador
        ├── household_id      ← Família a que pertence
        ├── tenant_id         ← Organização (família/escola/parceiro)
        └── school_tenant_id  ← Escola (para professores e crianças)

households                    ← Agregado familiar
  └── children                ← Crianças do encarregado
        ├── wallets           ← Carteira virtual da criança
        ├── ledger_entries    ← Histórico de transações
        ├── tasks             ← Tarefas atribuídas
        ├── savings_vaults    ← Cofrinhos de poupança
        ├── dream_vaults      ← Sonhos/objetivos
        ├── missions          ← Missões financeiras
        ├── badge_progress    ← Progresso em badges
        └── allowance_configs ← Configuração de mesada

tenants (escola/parceiro/família)
  ├── subscription_tiers      ← Plano de subscrição
  └── classrooms              ← Turmas (escolas)
        └── classroom_students ← Alunos matriculados

partner_programs              ← Programas de parceiros
  └── program_invitations     ← Convites a famílias/escolas
```

### 3.2 Problemas no Modelo de Dados

**PROBLEMA:** `profiles` tem tanto `tenant_id` como `school_tenant_id`.  
- Para um professor: `tenant_id` pode ser nulo e `school_tenant_id` aponta para a escola.  
- Para um encarregado: `tenant_id` pode apontar para o tenant familiar, `school_tenant_id` para a escola dos filhos.  
- Esta dualidade é confusa e não está documentada.  
- **Requisito:** Clarificar e documentar quando cada campo é usado por cada role. Considerar usar apenas `tenant_id` com o `tenant_type` para distinguir.

**PROBLEMA:** `children.school_tenant_id` existe mas não há fluxo claro para o preencher.  
- O encarregado pode associar um filho a uma escola via `EditChildDialog.tsx`, mas é um campo pouco visível.  
- **Requisito:** Tornar explícita a associação criança-escola no fluxo de criação.

**PROBLEMA:** A `household_guardians` (co-encarregados) existe na BD mas está apenas parcialmente integrada na UI (`ParentChildren.tsx`).  
- **Requisito:** Definir claramente as permissões do co-encarregado (leitura? escrita? aprovação de tarefas?).

---

## 4. Funcionalidades por Perfil

### 4.1 Encarregado (`parent`)

| Funcionalidade | Rota | Estado |
|----------------|------|--------|
| Dashboard familiar | `/parent` | ✅ Implementado |
| Gestão de filhos | `/parent/children` | ✅ Implementado |
| Tarefas | `/parent/tasks` | ✅ Implementado |
| Missões | `/parent/missions` | ✅ Implementado |
| Mesada | `/parent/allowance` | ✅ Implementado |
| Relatórios | `/parent/reports` | ✅ Implementado |
| Cofrinhos | `/parent/vaults` | ✅ Implementado |
| Sonhos | `/parent/dreams` | ✅ Implementado |
| Recompensas | `/parent/rewards` | ✅ Implementado |
| Insights comportamentais | `/parent/insights` | ✅ Implementado |
| Atividade recente | `/parent/activity` | ✅ Implementado |
| Subscrição | `/parent/subscription` | ✅ Implementado |
| Consentimento RGPD | `/parent/consent` | ✅ Implementado |
| Suporte | `/parent/support` | ✅ Implementado |
| Co-encarregados | `/parent/children` | ⚠️ Parcialmente implementado |

**Problemas identificados:**
- Aprovação de tarefas dos filhos existe mas o fluxo de notificação não é consistente.
- O `currentChildId` no `AuthContext` sugere que o encarregado "seleciona" um filho ativo, mas não há UI clara para esta seleção em todas as páginas.
- **Requisito:** Clarificar o conceito de "filho selecionado" — deve ser explícito e persistente na sessão.

### 4.2 Criança (`child`)

| Funcionalidade | Rota | Estado |
|----------------|------|--------|
| Dashboard | `/child` | ✅ Implementado |
| Carteira | `/child/wallet` | ✅ Implementado |
| Tarefas | `/child/tasks` | ✅ Implementado |
| Missões | `/child/missions` | ✅ Implementado |
| Cofrinhos | `/child/vaults` | ✅ Implementado |
| Conquistas | `/child/achievements` | ✅ Implementado |
| Badges | `/child/badges` | ✅ Implementado |
| Streaks | `/child/streaks` | ✅ Implementado |
| Loja | `/child/store` | ✅ Implementado |
| Diário | `/child/diary` | ✅ Implementado |
| Sonhos | `/child/dreams` | ✅ Implementado |
| Ranking | `/child/ranking` | ✅ Implementado |
| Aprender | `/child/learn` | ✅ Implementado |

**Nota:** A criança usa login especial com `username + PIN` (não email/password). O email sintético é `username@child.kivara.local`.

### 4.3 Adolescente (`teen`)

| Funcionalidade | Rota | Estado |
|----------------|------|--------|
| Dashboard | `/teen` | ✅ Implementado |
| Carteira | `/teen/wallet` | ✅ Implementado |
| Tarefas | `/teen/tasks` | ✅ Implementado |
| Missões | `/teen/missions` | ✅ Implementado |
| Cofrinhos | `/teen/vaults` | ✅ Implementado |
| Análise financeira | `/teen/analytics` | ✅ Implementado |
| Aprender | `/teen/learn` | ✅ Implementado |
| Badges | `/teen/badges` | ✅ Implementado |
| Streaks | `/teen/streaks` | ✅ Implementado |

**Diferenças Teen vs Child (intenção do sistema):**
- Teen tem `monthlyBudget` e `weeklySpendLimit` (controlo de gastos mais granular)
- Teen tem `TeenAnalytics` (análise de categorias de gastos — não existe em child)
- Teen NÃO tem: Loja, Diário, Ranking, Conquistas (mais orientado para autonomia)
- Teen pode ter email real (não apenas username+PIN)

**Problemas identificados:**
- **CRÍTICO:** O teen é criado com role `child` — nunca acede às rotas `/teen/*`.
- Não existe distinção de UI entre criar conta de "criança" e "adolescente" no formulário do encarregado.
- **Requisito:** O formulário de criação deve perguntar se é criança (< 13) ou adolescente (≥ 13), OU derivar automaticamente da data de nascimento.

### 4.4 Professor (`teacher`)

| Funcionalidade | Rota | Estado |
|----------------|------|--------|
| Dashboard | `/teacher` | ✅ Implementado |
| Turmas | `/teacher/classes` | ✅ Implementado |
| Desafios coletivos | `/teacher/challenges` | ✅ Implementado |
| Perfil do aluno | `/teacher/student/:id` | ✅ Implementado |
| Perfil da escola | `/teacher/school` | ✅ Só leitura |
| Perfil próprio | `/teacher/profile` | ⚠️ Sem edição de escola |

**Problemas identificados:**
- O professor não pode mudar de escola após o registo.
- O professor não pode criar alunos — apenas adiciona alunos existentes às turmas. **Como chegam os alunos ao sistema?** O fluxo não está claro.
- `useSchoolStudents` busca `profiles.school_tenant_id` mas não `classroom_students` — um aluno "da escola" pode não estar em nenhuma turma do professor.
- **Requisito:** Definir claramente o fluxo de incorporação de alunos no contexto escolar.

### 4.5 Parceiro (`partner`)

| Funcionalidade | Rota | Estado |
|----------------|------|--------|
| Dashboard | `/partner` | ✅ Implementado |
| Programas | `/partner/programs` | ✅ Implementado |
| Desafios | `/partner/challenges` | ✅ Implementado |
| Relatórios | `/partner/reports` | ✅ Implementado |
| Subscrição | `/partner/subscription` | ✅ Implementado |
| Perfil | `/partner/profile` | ✅ Implementado |

**Modelo:** O parceiro cria `partner_programs` que convidam famílias ou escolas via `program_invitations`. As famílias/escolas aceitam em `/invite/program/:code`.

### 4.6 Administrador (`admin`)

| Área | Rota | Funcionalidade |
|------|------|----------------|
| Dashboard | `/admin` | KPIs globais |
| Tenants | `/admin/tenants` | CRUD de organizações |
| Escolas | `/admin/schools` | CRUD de escolas |
| Subscrições | `/admin/subscriptions` | Gestão de planos |
| Utilizadores | `/admin/users` | Vista de todos os perfis |
| Moedas | `/admin/currencies` | Gestão de câmbios |
| Finanças | `/admin/finance` | Emissão monetária |
| Auditoria | `/admin/audit` | Logs de auditoria |
| Risco | `/admin/risk` | Flags de risco |
| Segurança Auth | `/admin/auth-security` | Tentativas de login |
| Conformidade | `/admin/compliance` | RGPD/dados |
| Lições | `/admin/lessons` | Gestão de micro-lições |
| Missões | `/admin/missions` | Templates de missões |
| Onboarding | `/admin/onboarding` | Passos de onboarding |
| Notificações | `/admin/notifications` | Broadcast de notificações |
| Banners | `/admin/banners` | Banners promocionais |

---

## 5. Sistema de Wallet e Transações

### 5.1 Modelo Atual

```
wallets (1:1 com children)
  ├── balance         ← Saldo atual
  └── ledger_entries  ← Histórico completo
        ├── amount
        ├── entry_type ('credit' | 'debit')
        ├── description
        └── reference_id (opcional)
```

### 5.2 Fluxos de Transação (Edge Functions)

| Edge Function | Descrição |
|--------------|-----------|
| `create-transaction` | Cria transação genérica |
| `vault-deposit` | Depósito em cofrinho |
| `vault-withdraw` | Levantamento de cofrinho |
| `vault-interest` | Cálculo de juros |
| `process-allowances` | Pagamento automático de mesadas |
| `resolve-budget-exception` | Resolve exceção de orçamento (teen) |
| `claim-reward` | Resgate de recompensa |
| `wallet-admin` | Operações administrativas |

### 5.3 Problemas Identificados

**PROBLEMA:** O `balance` está tanto em `wallets.balance` como é calculável via `ledger_entries`. Podem ficar dessincronizados.  
**Requisito:** O saldo deve ser sempre derivado do ledger (source of truth). O `balance` em `wallets` deve ser um campo calculado/atualizado por trigger.

**PROBLEMA:** Não existe controlo de concorrência explícito nas transações.  
**Requisito:** As transações devem ser atómicas (usar funções PostgreSQL com transações ACID).

**PROBLEMA:** `budget_exceptions` existem para o teen mas o fluxo de aprovação pelo encarregado não está bem integrado.  
**Requisito:** Definir o fluxo completo: teen tenta gastar além do limite → exceção criada → encarregado notificado → encarregado aprova/rejeita → transação processada ou negada.

---

## 6. Sistema de Subscrições e Tenants

### 6.1 Planos Existentes

| Plano | Tipo | Filhos | Turmas | Preço/mês |
|-------|------|--------|--------|-----------|
| Free | `free` | 3 | 0 | 0 |
| Family Premium | `family_premium` | 10 | 0 | 4.99 USD |
| School Institutional | `school_institutional` | 200 | 20 | 29.99 USD |
| Partner Program | `partner_program` | 1000 | 100 | 99.99 USD |

### 6.2 Problemas Identificados

**PROBLEMA:** O plano "Free" tem 3 filhos mas o código tem `maxChildren = 2` como default.  
**Requisito:** Sincronizar o limite padrão no código com o valor da base de dados.

**PROBLEMA:** Existe `extra_children_purchased` nas subscrições para adicionar slots extra, mas a lógica de verificação está duplicada entre o frontend (`ParentChildren.tsx`) e a Edge Function (`create-child-account`).  
**Requisito:** A verificação de limites deve existir apenas no backend.

**PROBLEMA:** Não existe separação clara entre o tenant de uma **família** e o de uma **escola**. Um encarregado tem `tenant_id` (o seu household tenant) e opcionalmente `school_tenant_id`. Um professor tem `school_tenant_id` mas pode não ter `tenant_id`.  
**Requisito:** Simplificar — cada utilizador deve ter exactamente um tenant primário com um `tenant_type` claro.

---

## 7. Sistema Escolar

### 7.1 Fluxo Atual

```
Admin cria escola (tenant_type='school')
  → Professor regista-se e seleciona escola (school_tenant_id em profiles)
  → Professor cria turmas (classrooms.teacher_profile_id)
  → Professor adiciona alunos às turmas (classroom_students)
  → Professor cria desafios coletivos (collective_challenges)
```

### 7.2 Problemas Identificados

**PROBLEMA CRÍTICO:** Não há fluxo definido para como um aluno (criança) entra no sistema escolar.  
- Existe `children.school_tenant_id` mas não há UI para o encarregado associar o filho a uma escola de forma natural.  
- O professor vê "alunos da escola" via `profiles.school_tenant_id` mas este campo em `profiles` não corresponde aos alunos/`children` — corresponde a outros professores!  
- `useSchoolStudents` em `TeacherClasses.tsx` faz `.from('profiles').eq('school_tenant_id', ...)` — isto traz **professores**, não alunos.

**PROBLEMA CRÍTICO:** `useSchoolStudents` busca profiles com `school_tenant_id`, mas alunos são registados como `children` (não `profiles` diretamente acessíveis por este campo).  
**Requisito:** Clarificar o modelo: alunos devem ser encontrados via `children.school_tenant_id` → `children.profile_id` → `profiles`.

**PROBLEMA:** O professor não pode alterar a escola após o registo.  
**Requisito:** Deve existir forma do professor (ou admin) alterar a escola associada.

**PROBLEMA:** Não há conceito de "ano letivo" ou ciclo temporal nas turmas.  
**Requisito:** Adicionar `academic_year` às turmas para permitir reutilização entre anos.

---

## 8. Sistema de Gamificação

### 8.1 Componentes

| Componente | Tabela | Descrição |
|------------|--------|-----------|
| KivaPoints | `kiva_points_log` | Pontos ganhos por ações |
| Níveis | Calculado dos pontos | apprentice → saver → planner → investor → master |
| Badges | `badges` + `badge_progress` | Colecionáveis por categoria/tier |
| Streaks | `streak_activities` | Dias consecutivos de atividade |
| Missões | `missions` | Objetivos financeiros com recompensa |
| Desafios semanais | `weekly_challenges` | Desafios temporais |
| Desafios coletivos | `collective_challenges` | Por turma (professores) |
| Ranking | Calculado | Household e turma |

### 8.2 Problemas Identificados

**PROBLEMA:** O teen NÃO tem `ChildAchievements` nem `ChildRanking` — funcionalidades que existem para a criança mas não para o adolescente.  
**Requisito:** Definir explicitamente quais funcionalidades de gamificação existem para cada perfil.

**PROBLEMA:** O `level` é calculado a partir dos KivaPoints mas não existe lógica explícita que sincronize `profiles.level` (ou campo equivalente) com os pontos acumulados.  
**Requisito:** O nível deve ser recalculado automaticamente quando os pontos sobem.

---

## 9. Sistema de Notificações

### 9.1 Canais

| Canal | Edge Function | Estado |
|-------|--------------|--------|
| In-app | `notifications` table | ✅ |
| Push (Web/PWA) | `send-push-notification` | ✅ |
| Push (Nativo) | `use-native-push` | ✅ |
| Email | Não identificado | ❌ Ausente |
| Summary semanal | `weekly-summary` | ✅ |

**Requisito:** Definir quais eventos disparam notificações para cada perfil, e garantir consistência entre canais.

---

## 10. Segurança e Autenticação

### 10.1 Mecanismos Implementados

| Mecanismo | Descrição |
|-----------|-----------|
| 2FA | Para `parent` e `admin` — via `verify-2fa` edge function |
| Dispositivos de confiança | Token em `localStorage` para bypass de 2FA |
| Auth guard | Rate limiting e lockout via `auth-guard` edge function |
| Idle timeout | 30 min (parent), 15 min (admin) |
| RLS (Row Level Security) | Em todas as tabelas sensíveis |
| Audit log | `audit_logs` table via triggers |
| Risk flags | `risk_flags` table — monitorização de transações suspeitas |

### 10.2 Problemas Identificados

**PROBLEMA:** O login de criança usa email sintético `username@child.kivara.local` + PIN como password. O PIN é de 4 dígitos — muito fraco como password Supabase Auth.  
**Requisito:** O PIN deve ser armazenado com hash na tabela `children` e a autenticação deve ser feita via Edge Function que verifica o hash, não via Supabase Auth diretamente.

**PROBLEMA:** O `device_token` de 2FA é guardado em `localStorage` — partilhado entre abas/sessões do mesmo browser, não é seguro como "dispositivo de confiança".  
**Requisito:** O token deve ser associado a um dispositivo específico (fingerprint) e ter expiração.

---

## 11. Edge Functions — Inventário

| Edge Function | Propósito |
|--------------|-----------|
| `create-child-account` | Cria conta de criança/teen |
| `create-transaction` | Processa transação de wallet |
| `vault-deposit` / `vault-withdraw` | Operações de cofrinho |
| `vault-interest` | Juros simulados |
| `process-allowances` | Mesadas automáticas |
| `resolve-budget-exception` | Exceções de orçamento teen |
| `claim-reward` | Resgate de recompensa |
| `wallet-admin` | Admin wallet operations |
| `generate-missions` | Geração de missões (AI?) |
| `suggest-missions` / `suggest-tasks` / `suggest-rewards` | Sugestões IA |
| `complete-mission` | Conclusão de missão |
| `complete-challenge` | Conclusão de desafio |
| `generate-lesson` | Geração de lições |
| `generate-insights` | Geração de insights comportamentais |
| `notification-engine` | Motor de notificações |
| `send-push-notification` | Envio de push |
| `weekly-summary` | Resumo semanal |
| `process-billing` | Faturação de subscrições |
| `upgrade-subscription` | Upgrade de plano |
| `add-extra-child-slot` | Slot extra de filho |
| `invite-guardian` | Convite de co-encarregado |
| `claim-referral` | Reclamação de referral |
| `auth-guard` | Rate limiting de auth |
| `verify-2fa` | Verificação 2FA |
| `generate-recurring-tasks` | Tarefas recorrentes |
| `generate-vapid-keys` | Chaves VAPID para push |
| `risk-scan` | Análise de risco |
| `export-user-data` | Exportação RGPD |
| `anonymize-user-data` | Anonimização RGPD |
| `elevenlabs-tts` | Text-to-speech para lições |
| `seed-test-accounts` | Contas de teste |

**Observação:** 34 edge functions para operações muito granulares sugere que a lógica de negócio está excessivamente fragmentada. Considerar consolidar operações relacionadas.

---

## 12. Problemas Arquiteturais — Resumo Priorizado

### 🔴 Críticos (bloqueiam funcionalidade)

1. **Child vs Teen não diferenciados na criação** — todos os utilizadores criados por encarregados ficam como `child`, nunca acedem a `/teen/*`.
2. **`useSchoolStudents` busca professores, não alunos** — a query usa `profiles.school_tenant_id` que para alunos está vazio, trazendo resultados errados.
3. **Saldo de wallet pode dessincronizar** — `wallets.balance` e `ledger_entries` são fontes de dados separadas sem sincronização garantida.

### 🟡 Importantes (degradam a experiência)

4. **Modelo TypeScript desatualizado** — `src/types/kivara.ts` não reflete o esquema real da BD (campos inexistentes, nomes diferentes).
5. **Professor não pode mudar de escola** — associação permanente criada no registo sem possibilidade de edição.
6. **Co-encarregados parcialmente integrados** — tabela existe, convite funciona, mas permissões não estão definidas.
7. **Verificação de limites duplicada** — frontend e backend verificam independentemente o limite de filhos.
8. **Fluxo de aluno em escola não definido** — não há percurso claro para um filho ser associado a uma escola.

### 🟢 Melhorias (qualidade e manutenibilidade)

9. **`tenant_id` vs `school_tenant_id` em profiles** — dualidade confusa; simplificar para um único `tenant_id` com `tenant_type`.
10. **PIN de 4 dígitos via Supabase Auth** — fraco como mecanismo de autenticação; deve ser validado via Edge Function.
11. **34 Edge Functions** — demasiado granulares; consolidar operações relacionadas.
12. **Nível de utilizador não sincronizado automaticamente** — deve ser recalculado por trigger ao atualizar KivaPoints.
13. **Sem conceito de ano letivo nas turmas** — impede reutilização de estruturas entre anos.
14. **Sem notificação por email** — apenas push e in-app.

---

## 12.2 Problemas Adicionais — Análise Aprofundada

### 🔴 Críticos (adicionais)

15. **KivaPoints não persistidos na BD** — calculados on-the-fly por agregação de missions/lessons/badges/streaks. Leaderboards requerem queries O(n) muito pesadas. **Requisito:** Desnormalizar como coluna cacheada em `profiles`; atualizar por trigger.

16. **Race condition: Aprovação de tarefa → Ledger** — a tarefa é aprovada mas a entrada no ledger é criada assincronamente. A criança pode tentar gastar antes da recompensa ser registada. **Requisito:** Aprovação e entrada no ledger devem ser atómicas numa única transação PostgreSQL.

17. **Emissão parental não enforçada atomicamente** — `monthly_emission_limit_override` é verificado na app mas não em `create-transaction`. Requests paralelos podem ultrapassar o limite. **Requisito:** Enforçar com row-level lock na `create-transaction` Edge Function.

18. **Tarefas recorrentes não idempotentes** — `generate-recurring-tasks` cria duplicados se chamada mais que uma vez. **Requisito:** Adicionar `UNIQUE(recurrence_source_id, period)` e usar UPSERT.

### 🟡 Importantes (adicionais)

19. **Rankings de colegas sem consentimento** — `useClassmateRankings()` expõe métricas de pares sem opt-out. **Risco RGPD.** **Requisito:** Adicionar `visibility_setting` (private/classmates/friends) com default `private`.

20. **Desbloqueio de badges manual** — requisitos são descrições de texto, não regras executáveis. O admin deve desbloquear manualmente. **Requisito:** Guardar condições como JSON executável + trigger nos eventos relevantes.

21. **Streaks com duplicados** — `streak_activities` pode ter múltiplos registos por dia se a criança fizer login mais de uma vez. **Requisito:** Adicionar constraint `UNIQUE(profile_id, active_date)` + usar UPSERT.

22. **Date of birth sem encriptação** — `date_of_birth` armazenado em plaintext em `children` e `profiles`. **Risco COPPA/RGPD.** **Requisito:** Encriptar ou substituir por enum `age_group` (child/teen/adult).

23. **Sessão biométrica sem validação servidor** — `useBiometric()` existe mas não tem suporte backend. Chaves do dispositivo armazenadas localmente sem audit trail. **Requisito:** Implementar WebAuthn server-side + registo de dispositivo.

24. **2FA sem rate-limiting** — `verify-2fa` não limita tentativas. Brute-force possível. **Requisito:** Bloquear após 5 tentativas falhadas; registar tentativas no `audit_log`.

25. **Exportação RGPD não encriptada** — `export-user-data` faz dump de JSON para storage. Se bucket comprometido, todos os PII expostos. **Requisito:** Encriptar exports com chave derivada da password; links com expiração.

26. **Revogação de consentimento incompleta** — ao revogar consentimento de menor, dados históricos não são purgados. `anonymize-user-data` existe mas não está ligado ao fluxo de consentimento. **Requisito:** Implementar verdadeiro direito ao esquecimento em cascata.

27. **Conteúdo de lições como JSON sem validação** — `blocks` e `quiz` em `lessons` são JSON livre. Admin pode corromper dados sem validação de schema nem histórico de versões. **Requisito:** Criar tabela `lesson_versions`; validar schema JSON no save.

### 🟢 Melhorias (adicionais)

28. **Sem suporte offline** — app busca todos os dados do Supabase; sem sync offline-first. Utilizadores mobile em conectividade fraca: app inutilizável. **Requisito:** Implementar fila de mutations local + sync quando online.

29. **Símbolo de moeda hardcoded** — "KVC" codificado em muitos ficheiros. Tabela `supported_currencies` existe mas a UI ignora-a. **Requisito:** Carregar símbolo de moeda da configuração do tenant.

30. **Sem migração de conta** — se criança muda de encarregado, o KVC não transfere. Sem protocolo de account merge/migration. **Requisito:** Implementar transferência com aprovação de ambos os encarregados.

31. **Rate limiting em operações IA ausente** — `suggest-missions`, `suggest-rewards`, etc. chamam IA sem quota por utilizador. Risco de DoS. **Requisito:** Sliding window rate limiter nas Edge Functions que chamam IA.

32. **Multi-encarregado sem consenso** — Encarregado A aprova tarefa, Encarregado B revoga? Comportamento indefinido. **Requisito:** Definir modelo de aprovação: primeiro a aprovar, quórum, ou encarregado primário tem veto.

---

## 13. Requisitos Funcionais Propostos

### RF-01: Criação de Conta (Filho/Adolescente)
- O formulário de criação deve incluir data de nascimento como campo obrigatório
- O sistema deve atribuir role `child` se idade < 13 anos, `teen` se ≥ 13 anos
- O encarregado deve poder selecionar a escola do filho no momento de criação
- Deve existir confirmação visual das credenciais (username + PIN) após criação

### RF-02: Fluxo Escolar
- O encarregado deve poder associar/desassociar um filho de uma escola
- O professor deve poder pesquisar alunos por escola E por turma
- A query de alunos de escola deve usar `children.school_tenant_id → children.profile_id`
- O professor deve poder alterar a sua escola associada (com validação)
- As turmas devem ter um campo `academic_year` para organização temporal

### RF-03: Wallet e Transações
- O `wallets.balance` deve ser um campo derivado/sincronizado via trigger do ledger
- Todas as transações devem ser atómicas (sem race conditions)
- O fluxo de exceção de orçamento (teen) deve ter notificação push para o encarregado

### RF-04: Subscrição e Limites
- A verificação do limite de filhos deve existir APENAS no backend (Edge Function)
- O limite padrão deve ser lido sempre da base de dados, nunca hardcoded no frontend

### RF-05: Segurança
- O login de criança deve ser validado via Edge Function com hash do PIN, não via Supabase Auth direto
- Os dispositivos de confiança 2FA devem ter expiração e ser associados a fingerprint de dispositivo

### RF-06: Co-Encarregados
- Definir permissões explícitas: leitura total, aprovação de tarefas, gestão de filhos (opcional)
- O co-encarregado deve ter notificações das mesmas ações que o encarregado primário

---

## 14. Modelo de Dados Proposto (Correções)

```sql
-- Correção: children deve ter campo is_teen derivado da data de nascimento
ALTER TABLE children ADD COLUMN is_teen boolean GENERATED ALWAYS AS (
  date_of_birth IS NOT NULL AND 
  EXTRACT(YEAR FROM AGE(date_of_birth)) >= 13
) STORED;

-- O role deve ser atualizado quando a criança completa 13 anos
-- (via cron job ou recalculo no login)

-- Correção: wallet balance deve ser calculado do ledger
-- (via trigger ou view materializada)

-- Correção: classrooms deve ter ano letivo
ALTER TABLE classrooms ADD COLUMN academic_year text NOT NULL DEFAULT '2025/2026';

-- Correção: simplificar tenant para um único campo em profiles
-- school_tenant_id deve ser APENAS para identificar a escola de um professor
-- profiles de children não devem usar school_tenant_id (usar children.school_tenant_id)
```

---

## 15. Glossário

| Termo | Definição |
|-------|-----------|
| **KVC / KivaCoins** | Moeda virtual da plataforma |
| **KivaPoints** | Pontos de gamificação (diferentes de KVC) |
| **Household** | Agregado familiar (encarregado + filhos) |
| **Tenant** | Organização/entidade no sistema (família, escola, parceiro) |
| **Vault / Cofrinho** | Poupança com objetivo e juros simulados |
| **Dream Vault** | Objetivo a longo prazo com contribuição parental |
| **Mesada** | Pagamento periódico automático para a criança |
| **Mission** | Desafio financeiro com recompensa em KVC e KivaPoints |
| **Badge** | Conquista colecionável por categoria e tier |
| **Streak** | Sequência de dias consecutivos de atividade |
| **Budget Exception** | Pedido do teen para gastar além do limite |
| **Program Invitation** | Convite de parceiro a família/escola |

---

*ERS-KIVARA-001 v1.0 — Gerado por análise do código-fonte em 06-04-2026. Para esclarecimentos contactar a equipa de engenharia.*
