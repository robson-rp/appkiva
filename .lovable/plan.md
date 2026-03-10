

## Plano: Actualização em tempo real do plano de subscrição

### Problema

Quando o pai faz upgrade para "Família Premium", a criança não vê as funcionalidades desbloqueadas imediatamente porque:
1. O hook `useFeatureGate` tem `staleTime: 5 * 60 * 1000` (5 minutos de cache)
2. Não existe subscription Realtime na tabela `tenants` — quando o `subscription_tier_id` muda, ninguém é notificado
3. A tabela `tenants` não está na publicação `supabase_realtime`

### Solução

Duas alterações:

| Ficheiro | Acção |
|---|---|
| Migração SQL | `ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;` |
| `src/hooks/use-feature-gate.ts` | Adicionar `useEffect` com subscription Realtime na tabela `tenants` filtrado pelo `tenant_id` do utilizador. Ao detectar UPDATE, invalidar `queryClient.invalidateQueries({ queryKey: ['feature-gate'] })`. Reduzir `staleTime` para 30 segundos. |

### Detalhe técnico

No `useAllFeatures` e `useFeatureGate`, após obter o `tenant_id` do perfil (já disponível no resultado da query), subscrever a alterações:

```typescript
useEffect(() => {
  if (!tenantId) return;
  const channel = supabase
    .channel(`tenant-sub-${tenantId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'tenants',
      filter: `id=eq.${tenantId}`,
    }, () => {
      queryClient.invalidateQueries({ queryKey: ['feature-gate'] });
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [tenantId]);
```

Para ter acesso ao `tenantId` fora da queryFn, guardar num estado separado ou extrair do resultado da query.

Isto garante que quando o pai faz upgrade (que altera `tenants.subscription_tier_id`), todos os membros do household — incluindo as crianças — vêem as funcionalidades desbloqueadas instantaneamente.

