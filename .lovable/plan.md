

## Plano: Tabela `tier_regional_prices` com override opcional

### Objectivo
Permitir que administradores definam preços fixos para tiers específicos em mercados específicos (ex: "Parceiro Pro" em Angola = Kz 25.000/mês), substituindo a conversão dinâmica USD→moeda local quando existir um override.

### 1. Migration — Nova tabela

```sql
CREATE TABLE tier_regional_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  currency_code text NOT NULL,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  extra_child_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tier_id, currency_code)
);

ALTER TABLE tier_regional_prices ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage regional prices" ON tier_regional_prices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can read
CREATE POLICY "Anyone can view regional prices" ON tier_regional_prices
  FOR SELECT TO authenticated USING (true);
```

### 2. Hook — `use-regional-prices.ts`
- Query `tier_regional_prices` com `staleTime` longo
- Exportar helper `getRegionalPrice(tierId, currencyCode, rates)` que retorna o preço regional se existir, senão faz `convertPrice` dinâmico como fallback

### 3. Refactor nos consumidores (3 ficheiros)
Actualizar a função `localPrice` / `fmtP` em:
- `PartnerSubscription.tsx`
- `ParentSubscription.tsx`
- `PaymentSimulator.tsx`

Para usar `getRegionalPrice` em vez de chamar `convertPrice` directamente.

### 4. Interface de admin (opcional inline)
Adicionar na `AdminSubscriptions.tsx` um sub-painel no dialog de edição de tier com uma secção "Preços Regionais" — tabela simples com campos moeda/mensal/anual que faz CRUD na `tier_regional_prices`.

### Ficheiros a criar/editar
| Ficheiro | Acção |
|----------|-------|
| Migration SQL | Criar tabela + RLS |
| `src/hooks/use-regional-prices.ts` | Criar hook + helper |
| `src/hooks/use-exchange-rates.ts` | Actualizar `convertPrice` com override |
| `src/pages/partner/PartnerSubscription.tsx` | Usar regional override |
| `src/pages/parent/ParentSubscription.tsx` | Usar regional override |
| `src/components/PaymentSimulator.tsx` | Usar regional override |
| `src/pages/admin/AdminSubscriptions.tsx` | Secção de preços regionais no dialog |

