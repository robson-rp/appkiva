

## Plano: Custo por criança extra + revisão de funcionalidades

### Estado actual

| Plano | Tipo | $/mês | max_children | extra_child_price | Funcionalidades |
|-------|------|-------|--------------|-------------------|-----------------|
| Gratuito | free | 0 | 2 | 0 | savings_vaults |
| Família Premium | family | 3.99 | 5 | 0 | savings_vaults, dream_vaults, custom_rewards, budget_exceptions, multi_child, advanced_analytics, export_reports, real_money_wallet |
| Escola Institucional | school | 29.99 | 100 | 0 | savings_vaults, dream_vaults, custom_rewards, classroom_mode, advanced_analytics, export_reports, multi_child, priority_support |
| Parceiro Starter | partner | 0 | 20 | 800 (!) | basic_wallet, basic_tasks |
| Parceiro Pro | partner | 54.99 | 200 | 0 | basic_wallet, basic_tasks, advanced_analytics, export_reports, custom_branding |
| Parceiro Enterprise | partner | 219.99 | 500 | 0 | basic_wallet, basic_tasks, advanced_analytics, export_reports, custom_branding, api_access, priority_support |

### Problemas identificados
1. `extra_child_price` está a 0 na maioria (sem monetização) e a 800 no Starter (resíduo AOA)
2. O plano **Gratuito** não inclui `basic_wallet` nem `basic_tasks` — funcionalidades base que deveriam estar em todos
3. Os planos **Parceiro** não incluem `savings_vaults` nem `dream_vaults` — funcionalidades core para crianças
4. A **Escola** não tem `teacher_dashboard` — funcionalidade que existe no código

### Proposta: Funcionalidades por plano

Lógica: cada tier superior herda tudo do anterior + adiciona.

**Família:**
- **Gratuito**: `basic_wallet`, `basic_tasks`, `savings_vaults`
- **Família Premium**: tudo do Gratuito + `dream_vaults`, `custom_rewards`, `budget_exceptions`, `multi_child`, `advanced_analytics`, `export_reports`, `real_money_wallet`

**Escola:**
- **Escola Institucional**: `basic_wallet`, `basic_tasks`, `savings_vaults`, `dream_vaults`, `classroom_mode`, `teacher_dashboard`, `advanced_analytics`, `export_reports`, `multi_child`, `custom_rewards`

**Parceiro:**
- **Starter**: `basic_wallet`, `basic_tasks`, `savings_vaults`
- **Pro**: tudo do Starter + `dream_vaults`, `advanced_analytics`, `export_reports`, `custom_branding`, `custom_rewards`
- **Enterprise**: tudo do Pro + `api_access`, `priority_support`, `budget_exceptions`

### Proposta: Custo por criança extra (USD)

| Plano | max_children (base) | extra_child_price (USD) | Lógica |
|-------|---------------------|------------------------|--------|
| Gratuito | 2 | 0 (não permite extra) | Upgrade obrigatório |
| Família Premium | 5 | $0.99 | Marginal para famílias grandes |
| Escola Institucional | 100 | $0.50 | Volume escolar |
| Parceiro Starter | 20 | $1.50 | Incentivo ao upgrade |
| Parceiro Pro | 200 | $0.99 | Volume médio |
| Parceiro Enterprise | 500 | $0.49 | Volume alto, preço unitário baixo |

### Implementação

**1 update SQL** (via insert tool) para actualizar `extra_child_price` e `features` nos 6 tiers activos.

Não há alterações de código — os componentes já lêem `extra_child_price` e `features` da base de dados.

