## Problemas Identificados

### 1. Features do plano Premium nao correspondem aos checks do codigo

A tier "Família Premium" na base de dados tem: `[basic_wallet, basic_tasks, basic_rewards, savings_vaults, dream_vaults, analytics, custom_rewards]`

Mas o codigo verifica features como: `advanced_analytics`, `export_reports`, `real_money_wallet`, `multi_child`, `budget_exceptions`, `priority_support` -- que nao existem no array da tier.

Tambem ha um mismatch: o tier tem `analytics` mas o codigo verifica `advanced_analytics`.

**Correcao**: Actualizar o array de features da tier "Família Premium" na base de dados para incluir todas as features que um encarregado premium deve ter.

### 2. Botao de Upgrade visivel mesmo no plano maximo

`ParentSubscription.tsx` linha 147-152 mostra sempre o botao "Upgrade" independentemente do plano actual. Quando o encarregado ja tem "Família Premium" (o plano maximo para familias), nao existe plano superior -- o botao nao deve aparecer.

**Correcao**: Esconder o botao de upgrade e o `PaymentSimulator` quando o utilizador ja esta no plano maximo familiar. Mostrar em vez disso um badge "Plano maximo activo".

### 3. Moeda e idioma devem persistir apos registo

O idioma ja persiste via `localStorage('kivara-locale')`. A moeda e determinada pela cadeia: tenant currency → profile country → fallback AOA. Quando o encarregado cria conta com pais (ex: Angola), a moeda deve ser derivada do pais do perfil ate que o utilizador mude no perfil. Isto ja funciona no `useTenantCurrency`. Preciso verificar se o pais esta a ser gravado correctamente no signup.

---

## Plano de Implementacao

### Passo 1 — Migrar features da tier Premium

SQL migration para actualizar o array de features da tier "Família Premium" com todas as features que um encarregado premium deve ter:

```
savings_vaults, dream_vaults, advanced_analytics, custom_rewards, 
budget_exceptions, multi_child, export_reports, real_money_wallet, 
priority_support, basic_wallet, basic_tasks, basic_rewards
```

### Passo 2 — Esconder botao Upgrade quando ja esta no plano maximo

Em `ParentSubscription.tsx`:

- Determinar se existe algum tier familiar acima do actual
- Se nao existir, esconder botao de upgrade e mostrar mensagem "Tens o plano maximo"
- Manter secao de downgrade e historico de facturacao

### Passo 3 — Esconder UpgradePrompt/FeatureGateWrapper banners quando Premium

Como as features vao estar correctas na DB apos passo 1, o `FeatureGateWrapper` vai automaticamente mostrar `allowed=true` e nao renderizar o banner de upgrade. Nenhuma alteracao de codigo necessaria nestes componentes.

### Ficheiros alterados

- **Migration SQL** — actualizar `subscription_tiers.features` para "Família Premium"
- `**src/pages/parent/ParentSubscription.tsx**` — condicionar botao de upgrade

Preciso incluir a gestão das facturas das subscrições.  O encarregado poder na sua área a parte financeira com os subscrições pagas, com a recorrência de cobrançca caso o pagamento tenha sido mensal.