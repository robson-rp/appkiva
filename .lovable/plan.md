

## Auditoria pós-remix — O que ainda falta

### Tabelas de seed já populadas ✅
| Tabela | Registos |
|---|---|
| `login_banners` | 5 |
| `badges` | 19 |
| `lessons` | 10 |
| `mission_templates` | 15 |
| `notification_templates` | 15 |
| `onboarding_steps` | 21 |
| `currency_exchange_rates` | 10 |
| `donation_causes` | 6 |

### Tabelas de seed vazias — precisam de dados ❌

| Tabela | Impacto | Dados a inserir |
|---|---|---|
| `subscription_tiers` | Página de preços vazia, feature gating não funciona | 3 tiers: free, family_premium, school_institutional |
| `supported_currencies` | Selector de moeda no admin vazio | 13 moedas (AOA, MZN, BRL, EUR, CVE, STN, XOF, USD, NGN, KES, ZAR, GBP, PKR) |

### Tabelas operacionais vazias (normal — dados criados por utilizadores)
`profiles`, `households`, `wallets`, `children`, `missions`, `rewards`, `tasks`, `streaks`, `savings_vaults`, `dream_vaults`, `classrooms`, `partner_programs`, `audit_log`, `notifications` — estas ficam vazias até haver utilizadores reais. **Isto é normal.**

### Plano de implementação

**1 migração com 2 INSERTs:**

**subscription_tiers** (3 registos):
- **Free**: 0 AOA/mês, max 1 criança, 1 guardião, features básicas (basic_wallet, basic_tasks, savings_vaults)
- **Family Premium**: 2.500 AOA/mês (25.000/ano), max 5 crianças, 4 guardiões, todas as features família
- **School/Institutional**: 15.000 AOA/mês (150.000/ano), max 200 crianças, 50 turmas, features escola + API

**supported_currencies** (13 registos):
- Todas as moedas do ficheiro `countries-currencies.ts` (AOA, MZN, BRL, EUR, CVE, STN, XOF, USD, NGN, KES, ZAR, GBP + PKR)

### Resultado
- Página de preços (PricingSection) mostra os 3 planos com valores reais
- Feature gating (`useFeatureGate`) funciona correctamente
- Admin pode gerir moedas suportadas
- Plataforma 100% funcional sem mais seeds em falta

