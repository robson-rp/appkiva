

## Problema: Valor errado na factura

A factura foi guardada com `amount = 4.49` e `currency = EUR`, mas a interface mostra-a com o símbolo `Kz` (AOA) sem fazer conversão. Resultado: **"Kz 4"** em vez do valor real.

**Raiz do problema:**
1. O `upgrade-subscription` guardou a factura em EUR (€4.49) porque o tenant tinha `currency: EUR` no momento do upgrade (o edge function cria tenants com `currency: "EUR"` por defeito — linha 102)
2. O tenant foi depois corrigido para AOA, mas a factura antiga ficou em EUR
3. A UI usa `formatPrice(inv.amount, sym, dec)` — aplica o símbolo Kz ao valor 4.49 sem converter, e com 0 casas decimais mostra "Kz 4"

---

## Correcções

### 1. Corrigir a factura existente na base de dados
Converter o valor da factura de EUR para AOA (usando a taxa de câmbio USD→AOA e USD→EUR), ou recalcular a partir do preço regional/conversão correcta.

- AOA rate = 850 por USD, EUR não tem rate directa → converter via USD
- Preço do tier = $4.99 USD → 4.99 × 850 = **Kz 4 242**
- Actualizar a factura: `amount = 4241.50`, `currency = 'AOA'`

### 2. Corrigir o edge function `upgrade-subscription`
Linha 102: quando cria tenant novo, usar a moeda do perfil do utilizador (derivada do país) em vez de `"EUR"` fixo.

```
// Buscar país do perfil → derivar moeda
const profile = ... // já tem o profile
const { data: profileFull } = await supabaseAdmin
  .from("profiles").select("country").eq("id", profile.id).single();
// Mapear país → moeda (AO → AOA, BR → BRL, etc.)
```

### 3. Converter valor na UI quando moedas não coincidem
Na `ParentSubscription.tsx`, quando `inv.currency !== code` (moeda do tenant), converter o valor antes de mostrar, usando as exchange rates. Assim mesmo facturas antigas em moeda diferente aparecem correctas.

### Ficheiros alterados
| Ficheiro | Acção |
|---|---|
| `supabase/functions/upgrade-subscription/index.ts` | Usar moeda do perfil/país ao criar tenant |
| `src/pages/parent/ParentSubscription.tsx` | Converter `inv.amount` quando `inv.currency ≠ tenant currency` |
| **Data fix** | Actualizar factura existente: amount=4241.50, currency=AOA |

