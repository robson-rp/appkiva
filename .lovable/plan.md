

# Melhorar página Admin Subscriptions — CRUD completo + filtros

## Contexto actual
A página `AdminSubscriptions` apenas lista os tiers activos em cards estáticos, sem possibilidade de editar, criar ou filtrar.

## Alterações

### 1. Hook `use-tenants.ts` — adicionar mutations para tiers
- `useCreateSubscriptionTier` — insert na tabela `subscription_tiers`
- `useUpdateSubscriptionTier` — update por id
- Ambos invalidam `['subscription_tiers']`
- Alterar `useSubscriptionTiers` para aceitar parâmetro opcional `showInactive` (remover filtro `is_active` quando true, para admin ver todos)

### 2. Página `AdminSubscriptions.tsx` — reescrever com:

**Header com stats resumidos**: total de planos, activos, inactivos

**Barra de filtros**:
- Filtro por tipo (free / family_premium / school_institutional / partner_program) via Select
- Filtro por estado (Activo / Inactivo / Todos) via Select
- Pesquisa por nome via Input
- Botão "Novo Plano" que abre dialog de criação

**Tabela em vez de cards**: layout mais profissional para admin com colunas:
- Nome, Tipo (badge), Preço mensal, Preço anual, Max crianças, Max turmas, Moeda, Estado (badge verde/cinza), Acções (Editar)

**Dialog de criação/edição** (componente inline ou separado):
- Campos: nome, tier_type (select com os 4 enum values), price_monthly, price_yearly, max_children, max_classrooms, currency, is_active (switch), features (textarea, uma por linha)
- Validação com zod
- Modo edição pré-preenche os campos

### 3. Detalhes técnicos
- RLS já permite admins fazer ALL na tabela `subscription_tiers`
- Enum `subscription_tier_type` tem 4 valores: free, family_premium, school_institutional, partner_program
- Sem alterações à base de dados necessárias
- Filtros aplicados client-side (volume de dados pequeno)

