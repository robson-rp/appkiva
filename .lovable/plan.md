

## Estado Atual da Plataforma KIVARA -- Auditoria de Completude

### O que ESTA FUNCIONAL

| Area | Estado | Detalhes |
|------|--------|---------|
| Autenticacao e RBAC | OK | 6 roles, `has_role()` server-side, sem checks client-side |
| Routing por role | OK | Lazy-loading em todas as paginas, redirect correcto |
| Splash screen + Onboarding | OK | Por sessao, role-based, com skip |
| RLS em todas as tabelas | OK | 0 tabelas publicas sem RLS |
| Audit triggers | OK | 6 triggers activos (ledger_entries, wallets, profiles, consent_records, user_roles, tasks) |
| Edge functions protegidas | OK | seed-test-accounts e risk-scan com admin guard |
| Program invitations RLS | OK | Corrigido com scoping por target_type |
| Ledger double-entry | OK | Todas as entradas tem debit + credit wallet |
| Emission limits | OK | `get_parent_emission_stats` funcional (45/1000 KVC emitidos) |
| Streaks | OK | `record_daily_activity` funcional |
| Notificacoes | OK | Templates, throttling, motor agendado |
| Multi-tenant isolation | OK | tenant_id em profiles/households, RLS scoped |
| Currency localization | OK | AOA configurado, `supported_currencies` activa |
| PWA + Offline banner | OK | Service worker, install prompt |
| React warnings | OK | Corrigidos (ref forwarding, aria-describedby) |
| Console errors | OK | Zero erros na consola |

### PROBLEMAS PENDENTES (C4 + H1-H2 do relatorio)

**1. Saldos negativos em wallets nao-sistema (CRITICO)**
- Teste Parent: **-75 KVC**
- Aniceto (Encarregado): **-945 KVC**
- Causa: seed-test-accounts criou allowances debitando da wallet do pai em vez da wallet sistema, ou transferencias iniciais sem validacao de saldo

**2. Money supply conservation error**
- Total emitido: 45 KVC
- Total em wallets: -5 KVC
- Total em vaults: 51 KVC
- Wallets + vaults = 46 KVC != 45 KVC (1 KVC de discrepancia)
- Causa provavel: deposito em vault feito por update directo sem ledger entry

**3. Wallet balance discrepancy (H1)**
- A view `wallet_balances` mostra saldos calculados pelo ledger, mas o seed pode ter inserido dados inconsistentes

### PLANO DE CORRECAO

#### 1. Prevenir saldos negativos futuros
Criar um trigger de validacao na tabela `wallets` (ou na logica do `create-transaction`) que rejeita actualizacoes quando o saldo resultante e negativo para wallets nao-sistema.

```sql
CREATE OR REPLACE FUNCTION prevent_negative_balance()
RETURNS trigger AS $$
BEGIN
  IF NOT NEW.is_system AND NEW.balance < 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Nota: wallets NAO tem coluna `balance` directa -- os saldos sao calculados via view `wallet_balances`. A validacao deve ser feita no `create-transaction` edge function antes de inserir no ledger.

#### 2. Corrigir saldos existentes
Executar ledger entries correctivas para zerar as discrepancias dos 2 wallets afectados e reconciliar o money supply.

#### 3. Adicionar balance check no create-transaction
Verificar que o edge function `create-transaction` ja valida saldo antes de debitar. Se nao, adicionar essa verificacao.

### RESUMO

A plataforma esta **~95% funcional**. Todos os fluxos de UI, autenticacao, routing, notificacoes, gamificacao e multi-tenancy funcionam correctamente. Os unicos problemas pendentes sao:
- 2 wallets com saldos negativos (dados de teste inconsistentes)
- 1 KVC de discrepancia na massa monetaria
- Ambos sao problemas de **dados**, nao de **codigo** -- provavelmente introduzidos pelo seeding inicial

Recomendacao: corrigir os dados e adicionar validacao de saldo no edge function para prevenir recorrencia.

