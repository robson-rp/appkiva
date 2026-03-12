

## Plano: Facturas com valor real, download PDF, gestao admin, e crianças extra

### Problemas Actuais

1. **Facturas sem valor real da subscrição**: O historico mostra `inv.amount` mas nao inclui o nome do plano associado (tier_id nao e resolvido para nome/preco).
2. **Sem download de factura**: Nao existe botao de download PDF para facturas.
3. **Admin nao tem visao de facturas**: `AdminSubscriptions.tsx` gere tiers mas nao lista facturas de todos os tenants. `AdminFinance.tsx` tambem nao mostra facturas.
4. **Crianças extra mediante pagamento**: Quando `childrenCount >= maxChildren`, abre `PaymentSimulator` para upgrade de plano. Falta a opcao de adicionar crianças extra sem mudar de plano, pagando `extra_child_price`.

---

### Implementacao

#### 1. Facturas com valor real e nome do plano

**Ficheiro**: `src/hooks/use-subscription.ts`
- Alterar query de `useInvoices` para fazer join com `subscription_tiers` via `tier_id`:
  ```
  .select('*, subscription_tiers(name, tier_type)')
  ```
- Actualizar interface `SubscriptionInvoice` para incluir `tier_name`.

**Ficheiro**: `src/pages/parent/ParentSubscription.tsx`
- Mostrar nome do plano na linha da factura (ex: "Família Premium · Kz 2.490").

#### 2. Download de factura em PDF

**Ficheiro**: `src/pages/parent/ParentSubscription.tsx`
- Usar `jspdf` (ja instalado) para gerar PDF com:
  - Logo Kivara, nome do tenant, dados da factura
  - Numero da factura, data, valor, moeda, estado, metodo de pagamento
  - Botao `Download` (icone) em cada linha do historico de facturas

Criar funcao utilitaria `generateInvoicePdf(invoice, tenantName, currencySymbol)` num ficheiro `src/lib/invoice-pdf.ts`.

#### 3. Gestao financeira no Admin

**Ficheiro**: `src/pages/admin/AdminSubscriptions.tsx`
- Adicionar nova tab/seccao "Facturas" com:
  - Tabela de todas as facturas (join com tenants e tiers para mostrar nome do tenant e plano)
  - Filtros por estado (paid/pending/failed), por tenant, por periodo
  - Totais agregados (receita total, pendente, falhada)
  - Possibilidade de marcar factura como paga manualmente

**Ficheiro**: `src/hooks/use-subscription.ts`
- Criar `useAdminInvoices()` hook que lista todas as facturas (sem filtro por tenant) — protegido por RLS admin.

**DB Migration**: Adicionar RLS policy para admins lerem `subscription_invoices`:
```sql
CREATE POLICY "Admins can view all invoices"
ON public.subscription_invoices FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoices"
ON public.subscription_invoices FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

#### 4. Adicionar crianças extra mediante pagamento

**Ficheiro**: `src/pages/parent/ParentChildren.tsx`
- Quando `childrenCount >= maxChildren`, em vez de abrir upgrade de plano, mostrar dialog com 2 opcoes:
  - "Fazer upgrade do plano" (comportamento actual)
  - "Adicionar criança extra" — mostra o preco por criança extra (`extra_child_price` do tier actual) e gera uma factura de pagamento unico

**Ficheiro**: `supabase/functions/add-extra-child-slot/index.ts` (novo)
- Edge function que:
  1. Verifica que o user e parent
  2. Obtem o tier actual e o `extra_child_price`
  3. Incrementa `max_children` override no tenant (novo campo) ou aumenta directamente
  4. Cria factura de pagamento unico com `billing_period = 'one_time'`
  5. Retorna sucesso

**DB Migration**: Adicionar campo `extra_children_purchased` ao `tenants`:
```sql
ALTER TABLE public.tenants 
ADD COLUMN extra_children_purchased integer NOT NULL DEFAULT 0;
```

**Ficheiro**: `supabase/functions/create-child-account/index.ts`
- Alterar calculo de `maxChildren` para: `tier.max_children + tenant.extra_children_purchased`

---

### Ficheiros Criados/Alterados

| Ficheiro | Accao |
|---|---|
| `src/lib/invoice-pdf.ts` | Criar — gerador PDF de factura |
| `src/hooks/use-subscription.ts` | Alterar — join tier name, hook admin |
| `src/pages/parent/ParentSubscription.tsx` | Alterar — tier name + download PDF |
| `src/pages/parent/ParentChildren.tsx` | Alterar — opcao criança extra |
| `src/pages/admin/AdminSubscriptions.tsx` | Alterar — seccao facturas admin |
| `supabase/functions/add-extra-child-slot/index.ts` | Criar — edge function |
| `supabase/functions/create-child-account/index.ts` | Alterar — considerar extras |
| `src/i18n/pt.ts` e `src/i18n/en.ts` | Alterar — novas chaves i18n |
| **Migration SQL** | RLS invoices para admin + `extra_children_purchased` em tenants |

