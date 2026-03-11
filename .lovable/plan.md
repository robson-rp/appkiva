

## Auditoria Final — O que falta para ficar 100%

### Estado actual pos-remix

| Categoria | Status |
|---|---|
| 44 tabelas | OK |
| Seed data (10 tabelas) | OK |
| 28 triggers (audit + updated_at + business) | OK |
| 18 DB functions | OK |
| 3 contas de teste | OK |
| RLS policies (100+) | OK |
| Views (wallet_balances, wallet_transactions) | OK |
| Edge functions | OK |

### Problemas encontrados

| # | Problema | Impacto | Correcao |
|---|---------|---------|----------|
| 1 | Trigger `on_profile_referral_code` foi removido | Novos utilizadores nao recebem codigo de referral | Recriar trigger na tabela `profiles` AFTER INSERT |
| 2 | Tabela `tier_regional_prices` vazia | Precos regionais nao aparecem no selector de moeda da landing page | Inserir precos regionais para os 3 tiers x moedas principais |
| 3 | `system_config` vazia | Configuracoes globais em falta | Inserir config base (maintenance_mode, app_version, etc.) |

### Plano de implementacao

**1. Restaurar trigger `on_profile_referral_code`**
- Migracao SQL: `CREATE TRIGGER on_profile_referral_code AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.auto_create_referral_code();`
- A funcao `auto_create_referral_code()` ja existe

**2. Seed `tier_regional_prices`**
- Inserir precos para Family Premium e School em MZN, BRL, EUR, USD, CVE, ZAR (6 moedas x 2 tiers pagos = 12 registos)
- Free tier nao precisa (preco 0 em todas as moedas)

**3. Seed `system_config`**
- Inserir configuracoes base: `maintenance_mode = false`, `min_app_version = 1.0.0`, `default_currency = AOA`

Nota: `weekly_challenges` usa dados mock client-side (`mockWeeklyChallenges` em `weekly-challenges-data.ts`) e nao precisa de seed na DB — funciona como na versao original.

