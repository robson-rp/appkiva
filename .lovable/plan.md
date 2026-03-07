

## Plano: Enforçar restrições de subscrição Gratuita em toda a plataforma

### Problema actual
O sistema de feature gates (`useFeatureGate`) existe e funciona em algumas páginas, mas há lacunas significativas. Com a subscrição "Gratuito" (features: `basic_wallet`, `basic_tasks`, `savings_vaults`), muitas funcionalidades premium continuam acessíveis sem restrição.

### Lacunas identificadas

| Página / Funcionalidade | Feature necessária | Estado actual |
|---|---|---|
| `TeenVaults` | `savings_vaults` | Sem gate |
| `ChildStore` (exceções de orçamento) | `budget_exceptions` | Sem gate |
| `ParentChildren` (secção exceções) | `budget_exceptions` | Sem gate |
| `ParentAllowance` (configurações avançadas) | — | Sem restrição |
| Botões de exportação/download (relatórios, dados) | `export_reports` | Sem gate |
| Navegação lateral (Parent/Child/Teen layouts) | Vários | Mostra tudo |

### Alterações planeadas

#### 1. Gate em `TeenVaults`
Adicionar `useFeatureGate(FEATURES.SAVINGS_VAULTS)` e envolver o conteúdo com `FeatureGateWrapper`.

#### 2. Gate em exceções de orçamento
- `ChildStore`: condicionar o botão "Pedir Exceção" ao feature `BUDGET_EXCEPTIONS`. Sem a feature, mostrar mensagem simples "Saldo insuficiente" sem opção de pedir exceção.
- `ParentChildren`: esconder a secção de exceções pendentes para Free tier.

#### 3. Gate em exportação de relatórios
Procurar botões de download/exportação em `ParentReports`, `ParentConsent`, `AdminFinance` e condicionar ao feature `EXPORT_REPORTS` (excepto admin que tem acesso total).

#### 4. Navegação condicional por tier
Nos layouts `ParentLayout`, `ChildLayout`, `TeenLayout`, usar `useAllFeatures` para esconder ou marcar com cadeado (🔒) os itens de menu que requerem features não disponíveis no tier actual. Itens bloqueados continuam visíveis mas desactivados, com tooltip "Requer upgrade".

#### 5. Limitar número de crianças no backend
Actualmente o `max_children` só é verificado no frontend. Adicionar verificação server-side na Edge Function `seed-test-accounts` ou no trigger de criação de `children` para rejeitar inserções acima do limite.

### Detalhes técnicos

- **Ficheiros a modificar**: `TeenVaults.tsx`, `ChildStore.tsx`, `ParentChildren.tsx`, `ParentLayout.tsx`, `ChildLayout.tsx`, `TeenLayout.tsx`, `ParentReports.tsx`, `ParentConsent.tsx`
- **Sem alterações de base de dados** — as features já estão correctamente configuradas na tabela `subscription_tiers`
- **Sem novas Edge Functions** — toda a lógica é frontend com validação existente no backend via `create-transaction`

