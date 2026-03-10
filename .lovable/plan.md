

## Plano: Funcionalidades activas após upgrade + Cobrança mensal automática

### Problemas identificados

1. **Features incompletas no tier "Família Premium"**: O tier actual tem `["savings_vaults", "dream_vaults", "custom_rewards", "budget_exceptions", "multi_child", "advanced_analytics", "export_reports", "real_money_wallet"]` — faltam `basic_wallet`, `basic_tasks`, `basic_rewards` e `priority_support`. A página de subscrição verifica contra `ALL_FEATURE_KEYS` que inclui estes valores, mostrando-os como inactivos.

2. **Tier "Gratuito" com features mínimas**: Apenas tem `["savings_vaults"]` — deveria ter `["basic_wallet", "basic_tasks", "basic_rewards", "savings_vaults"]`.

3. **Sem sistema de cobrança automática**: Não existe tabela de facturas nem processo recorrente.

---

### Solução

#### 1. Corrigir features dos tiers (UPDATE via insert tool)

Actualizar o tier "Família Premium" para incluir TODAS as feature keys, e o "Gratuito" para incluir as básicas.

```sql
UPDATE subscription_tiers 
SET features = '["basic_wallet","basic_tasks","basic_rewards","savings_vaults","dream_vaults","custom_rewards","budget_exceptions","multi_child","advanced_analytics","export_reports","real_money_wallet","priority_support"]'::jsonb 
WHERE id = '4c3089ee-2375-4602-8c1c-d0575b7484f5';

UPDATE subscription_tiers 
SET features = '["basic_wallet","basic_tasks","basic_rewards","savings_vaults"]'::jsonb 
WHERE id = 'dc1adb69-e9c6-44cd-a2a3-5aaf0d94864e';
```

#### 2. Alinhar ALL_FEATURE_KEYS com features reais

Actualizar `ParentSubscription.tsx` para incluir `basic_rewards` na lista e garantir que todas as features do tier aparecem correctamente.

#### 3. Tabela de facturas (migração)

```sql
CREATE TABLE public.subscription_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  billing_period text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'pending', -- pending, paid, failed, cancelled
  due_date date NOT NULL,
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Com RLS para que pais vejam as suas facturas e admins vejam todas.

#### 4. Edge Function `process-billing` (agendada)

Função diária que:
- Busca tenants com subscriptions pagas e última factura > 30 dias (ou sem factura)
- Cria nova factura com `status: 'pending'` e `due_date: now() + 30 dias`
- Envia notificação ao pai sobre cobrança

#### 5. Actualizar upgrade-subscription

Quando o pai faz upgrade, criar a primeira factura com `status: 'paid'` e `paid_at: now()`.

#### 6. Secção de histórico de facturas na ParentSubscription

Card adicional abaixo das features mostrando as últimas facturas com data, valor (na moeda do tenant) e estado.

---

### Ficheiros

| Ficheiro | Acção |
|---|---|
| Dados SQL (insert tool) | UPDATE features dos tiers Free e Família Premium |
| Migração SQL | Criar tabela `subscription_invoices` + RLS + publicação realtime |
| `supabase/functions/process-billing/index.ts` | **Novo** — Cobrança recorrente mensal |
| `supabase/functions/upgrade-subscription/index.ts` | Adicionar criação de primeira factura |
| `src/hooks/use-subscription.ts` | Adicionar hook `useInvoices()` |
| `src/pages/parent/ParentSubscription.tsx` | Alinhar `ALL_FEATURE_KEYS`, adicionar secção de facturas |
| `src/i18n/pt.ts` + `src/i18n/en.ts` | Chaves para facturas e estados |

