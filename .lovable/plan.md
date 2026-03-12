

## Restaurar Preços dos Pacotes (Pré-Remix)

### Estado actual vs Original

| Tier | Campo | Actual | Original (USD) |
|------|-------|--------|-----------------|
| Gratuito | price_monthly | 0 | 0 ✓ |
| Gratuito | max_children | 1 | **3** |
| Gratuito | features | 4 items | **3** (basic_wallet, basic_tasks, basic_rewards) |
| Família Premium | price_monthly | 2500 | **4.99** |
| Família Premium | price_yearly | 25000 | **49.99** |
| Família Premium | max_children | 5 | **10** |
| Escola/Institucional | price_monthly | 15000 | **29.99** |
| Escola/Institucional | price_yearly | 150000 | **299.99** |

Os preços originais estavam em **USD**. Os actuais parecem estar em centavos/AOA.

Os tiers de **Parceiro** (Starter/Pro/Enterprise) não existiam antes do remix — foram criados intencionalmente nesta sessão, por isso mantêm-se.

### Plano

**1. Actualizar `subscription_tiers` (via insert tool)**

Restaurar os 3 tiers familiares para os valores originais:
- **Gratuito**: max_children → 3, features → `["basic_wallet","basic_tasks","basic_rewards"]`
- **Família Premium**: price_monthly → 4.99, price_yearly → 49.99, max_children → 10, features → `["basic_wallet","basic_tasks","basic_rewards","savings_vaults","dream_vaults","analytics","custom_rewards"]`
- **Escola/Institucional**: price_monthly → 29.99, price_yearly → 299.99, features → `["basic_wallet","basic_tasks","basic_rewards","classroom_mode","teacher_dashboard","bulk_management","analytics"]`

**2. Actualizar `tier_regional_prices` (via insert tool)**

Recalcular os preços regionais dos 2 tiers pagos (Família Premium e Escola) para reflectir os novos preços USD base. Manter a mesma estrutura de moedas (MZN, BRL, EUR, USD, CVE, ZAR).

Não há alterações de código — os componentes `PricingSection` e `PartnerSubscription` já lêem os preços da DB.

