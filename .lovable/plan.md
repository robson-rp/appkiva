
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

### Caminho recomendado (dentro do Lovable)

**Fase A — Fundação Backend ✅ CONCLUÍDA**
1. ✅ Lovable Cloud activado
2. ✅ Schema criado: `households`, `profiles`, `children`, `user_roles`, `consent_records`
3. ✅ Enum `app_role` (parent, child, teen, teacher, admin)
4. ✅ Funções SECURITY DEFINER: `has_role()`, `get_user_household_id()`
5. ✅ RLS policies por household/família
6. ✅ Trigger auto-create profile on signup
7. 🔲 Implementar auth real (substituir AuthContext mock)
8. 🔲 Migrar mock data para tabelas reais

**Fase B — Ledger & Wallets ✅ CONCLUÍDA**
1. ✅ Tabela `wallets` com tipo (virtual/real) e moeda (KVC)
2. ✅ Tabela `ledger_entries` (double-entry: debit/credit, append-only, imutável)
3. ✅ Enum `ledger_entry_type` com 11 tipos de transacção
4. ✅ View `wallet_balances` — saldos derivados do ledger (nunca campo directo)
5. ✅ View `wallet_transactions` — transacções com direcção (credit/debit)
6. ✅ Função `get_profile_balance()` — SECURITY DEFINER
7. ✅ Trigger auto-create wallet on profile creation
8. ✅ RLS policies por household (append-only, sem UPDATE/DELETE)
9. ✅ Hook `useWalletBalance()` e `useWalletTransactions()` no frontend
10. 🔲 Edge function para criar transacções com validação server-side
11. 🔲 Migrar componentes de mock balance para ledger real

**Fase C — Policy Engine & Workflows**
1. Tabela `policies` + `policy_assignments`
2. Edge functions que validam regras antes de cada transacção
3. Workflow de aprovação parental (tarefa → aprovação → ledger entry)
4. Limites de gasto enforced server-side

**Fase D — Auditoria & Segurança**
1. Tabela `audit_log` (append-only)
2. Triggers em tabelas críticas
3. Consent records para menores ✅ (tabela criada)
4. Pseudonimização nos rankings

### Limitação do Lovable

O Lovable suporta React + Supabase/Cloud. Consegue implementar:
- Auth real com RLS e RBAC
- Schema relacional completo
- Edge functions (Deno) para lógica server-side
- Ledger como tabelas Supabase com RLS

**Não consegue**: API Gateway dedicado, micro-serviços separados, processamento de pagamentos reais, KYC/AML, emissão de cartões. Estes componentes vivem fora do Lovable.
