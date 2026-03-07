

## Plano: Migrar moeda base para USD

### Situação actual
- **Taxas de câmbio**: todas com `base_currency = 'EUR'`
- **Tiers família/escola**: já em USD
- **Tiers parceiro**: Pro e Enterprise em EUR, Starter em AOA
- **Código `convertPrice`**: hardcoded para usar EUR como intermediário
- **4 ficheiros** chamam `convertPrice` com `'EUR'` explícito

### Alterações

#### 1. Dados — Taxas de câmbio (via insert tool)
Actualizar todos os registos de `currency_exchange_rates`:
- `base_currency` → `'USD'`
- Recalcular rates dividindo pelo rate EUR→USD actual (1.08):
  - AOA: 985/1.08 ≈ 912
  - BRL: 6.10/1.08 ≈ 5.65
  - EUR: 1/1.08 ≈ 0.926
  - USD: 1
  - (etc. para todas as moedas)

#### 2. Dados — Tiers parceiro (via insert tool)
Converter preços dos tiers Pro e Enterprise de EUR para USD:
- **Pro**: $54.99/mês, $549.90/ano
- **Enterprise**: $219.99/mês, $2199.90/ano
- Actualizar `currency = 'USD'` em todos os partner tiers

#### 3. Código — `use-exchange-rates.ts`
Mudar `convertPrice` para usar `'USD'` como moeda intermediária em vez de `'EUR'`.

#### 4. Código — 4 ficheiros consumidores
Actualizar referências `'EUR'` → `'USD'` nas chamadas a `convertPrice`:
- `src/pages/partner/PartnerSubscription.tsx` (l.42-43)
- `src/components/PaymentSimulator.tsx` (l.68-69)
- `src/pages/partner/PartnerReports.tsx` (l.18)
- `src/pages/parent/ParentSubscription.tsx` (l.53)

### Ficheiros a editar
| Ficheiro | Tipo |
|----------|------|
| `src/hooks/use-exchange-rates.ts` | Código |
| `src/pages/partner/PartnerSubscription.tsx` | Código |
| `src/components/PaymentSimulator.tsx` | Código |
| `src/pages/partner/PartnerReports.tsx` | Código |
| `src/pages/parent/ParentSubscription.tsx` | Código |
| `currency_exchange_rates` (tabela) | Dados |
| `subscription_tiers` (tabela) | Dados |

