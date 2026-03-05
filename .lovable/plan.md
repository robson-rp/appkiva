

## Análise: Arquitectura Técnica KIVARA — Estado Actual vs Visão

### O que existe hoje

O projecto KIVARA é actualmente um **frontend React com dados mock** (sem backend real). Toda a lógica vive no cliente com `useState`, ficheiros de mock data, e autenticação simulada via `AuthContext` com utilizadores hardcoded.

**Cobertura actual por domínio:**

| Domínio da Arquitectura | Estado | Notas |
|---|---|---|
| Identity & Access | Simulado | Mock users, sem auth real, sem MFA |
| Family Graph | Parcial | Relações pai→filho nos mocks, sem modelo formal |
| Virtual Wallet | UI existe | Saldos em mock, sem ledger |
| Real Money Wallet | Inexistente | Fase 2 fintech |
| Ledger Service | Inexistente | Saldo é campo directo, não derivado |
| Rules & Policy Engine | Parcial | Limites de gasto como dados estáticos |
| Missions & Learning | UI completa | Lições, quizzes, missões — tudo mock |
| Chores & Rewards | UI completa | Workflow tarefa→aprovação visual |
| Gamification | UI completa | Badges, levels, streaks, avatares |
| Store | UI existe | Catálogo mock |
| Notifications | UI existe | Dados estáticos |
| Analytics & Insights | Parcial | Gráficos recharts com dados mock |
| Risk & Fraud | Inexistente | — |
| School Portal | UI completa | Dashboard, turmas, desafios, PDF export |

### O que isto significa

A arquitectura que descreves é **a visão correcta para um produto fintech real**, mas está a vários saltos de distância do estado actual. O projecto precisa de uma **transição faseada** de frontend-only para uma plataforma com backend real.

### Caminho recomendado (dentro do Lovable)

**Fase A — Fundação Backend (Lovable Cloud / Supabase)**
1. Conectar Supabase ou activar Lovable Cloud
2. Criar schema de base de dados: `users`, `profiles`, `households`, `children`, `user_roles`
3. Implementar auth real (Supabase Auth) com RBAC via tabela `user_roles`
4. RLS policies por household/família
5. Migrar mock data para tabelas reais

**Fase B — Ledger & Wallets**
1. Tabela `ledger_entries` (double-entry: debit/credit, append-only)
2. Views derivadas para saldos (nunca campo directo)
3. Edge functions para transacções (validação server-side)
4. Separação virtual wallet vs preparação para real wallet

**Fase C — Policy Engine & Workflows**
1. Tabela `policies` + `policy_assignments`
2. Edge functions que validam regras antes de cada transacção
3. Workflow de aprovação parental (tarefa → aprovação → ledger entry)
4. Limites de gasto enforced server-side

**Fase D — Auditoria & Segurança**
1. Tabela `audit_log` (append-only)
2. Triggers em tabelas críticas
3. Consent records para menores
4. Pseudonimização nos rankings

### Limitação do Lovable

O Lovable suporta React + Supabase/Cloud. Consegue implementar:
- Auth real com RLS e RBAC
- Schema relacional completo
- Edge functions (Deno) para lógica server-side
- Ledger como tabelas Supabase com RLS

**Não consegue**: API Gateway dedicado, micro-serviços separados, processamento de pagamentos reais, KYC/AML, emissão de cartões. Estes componentes vivem fora do Lovable.

### Próximo passo concreto

Para avançar, o primeiro passo é **conectar um backend** (Supabase ou Lovable Cloud) e começar pela Fase A — schema de identidade e famílias com auth real.

Queres que comece pela criação do schema de base de dados e autenticação real?

