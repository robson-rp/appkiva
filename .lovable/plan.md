

## Diagnóstico

Após inspecção da base de dados e do código, identifiquei 3 problemas concretos:

### 1. Dois planos gratuitos duplicados
A tabela `subscription_tiers` tem **4 registos** do tipo `partner_program`:
- **Parceiro Starter** — EUR, 50 crianças, 2 programas, €0 ✅
- **Parceiro** — USD, 200 crianças, 5 programas, $0 ❌ (plano antigo que não foi removido)
- **Parceiro Pro** — EUR, 500 crianças, 10 programas, €49.99
- **Parceiro Enterprise** — EUR, ilimitado, €199.99

O plano "Parceiro" (id `05c8bc6d`) é o tier original criado antes da diferenciação. Deve ser desactivado ou eliminado.

### 2. Preços hardcoded em EUR na página de Subscrição
Em `PartnerSubscription.tsx`, os preços aparecem com `€` fixo (linhas 62, 126-127) em vez de usar a conversão de moeda do tenant como o `PaymentSimulator` já faz correctamente.

### 3. Gestão dos planos
Os planos de parceiro são geridos na interface de administrador em `/admin/subscriptions`, onde o admin pode criar, editar e desactivar tiers. Não há problema aqui — é o local correcto.

---

## Plano de Correcção

| Acção | Detalhe |
|-------|---------|
| **Desactivar tier duplicado** | Migration SQL: `UPDATE subscription_tiers SET is_active = false WHERE id = '05c8bc6d-...'` |
| **Corrigir moeda em PartnerSubscription.tsx** | Usar `useTenantCurrency` + `useExchangeRates` + `convertPrice`/`formatPrice` para mostrar preços na moeda do parceiro, igual ao `PaymentSimulator` |
| **Corrigir moeda no hero** | Linha 62: substituir `€${limits.priceMonthly}` por preço formatado com moeda do tenant |

### Ficheiros a alterar
- `src/pages/partner/PartnerSubscription.tsx` — importar hooks de moeda e usar `formatPrice`/`convertPrice` em vez de `€` hardcoded
- Migration SQL — desactivar o tier "Parceiro" duplicado

