

## Plano: Filtrar planos de upgrade por papel do utilizador

### Problema
O `PaymentSimulator` (linha 113-117) mostra todos os tiers activos, sem filtrar por tipo. Um encarregado vê planos de escola e parceiro, que não fazem sentido para ele.

### Solução
Duas alterações simples:

**1. `ParentSubscription.tsx`** — filtrar os tiers passados ao `PaymentSimulator` para incluir apenas `free` e `family`:
```tsx
// Antes de passar tiers ao PaymentSimulator, filtrar:
const familyTiers = tiers.filter(t => t.tierType === 'free' || t.tierType === 'family');
```
Passar `familyTiers` em vez de `tiers` ao componente `PaymentSimulator` e à lógica de downgrade.

**2. Mesma lógica para `lowerTiers`** — já que `lowerTiers` deriva de `tiers`, ao filtrar a fonte, o downgrade também fica correcto.

Nenhuma alteração ao `PaymentSimulator.tsx` em si — a filtragem é feita no ponto de consumo, para que o componente continue reutilizável por parceiros e escolas.

### Ficheiros alterados
- `src/pages/parent/ParentSubscription.tsx` (1 linha adicionada + 3 referências actualizadas)

