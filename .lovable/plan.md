

## Plano: Excluir encarregados do Ranking familiar

### Problema

O hook `useHouseholdRankings` busca **todos os perfis** do household sem filtrar por papel. Os pais/encarregados aparecem no ranking ao lado dos filhos.

### Causa

A tabela `profiles` não tem coluna `role`. Os papéis estão na tabela `user_roles` (ligada por `user_id`). O query actual não faz qualquer filtragem.

### Solução

No `src/hooks/use-household-rankings.ts`, após obter os perfis do household, consultar `user_roles` para os `user_id` desses perfis e excluir os que têm role `parent`. Fluxo:

1. Buscar perfis do household (já existente)
2. Buscar `user_roles` para os `user_id` desses perfis
3. Filtrar, mantendo apenas perfis cujo papel é `child` ou `teen`
4. Continuar com o resto da lógica (wallets, vaults, donations)

| Ficheiro | Acção |
|---|---|
| `src/hooks/use-household-rankings.ts` | Adicionar query a `user_roles` e filtrar perfis com role `child` ou `teen` |

Igualmente aplicar o mesmo filtro no `useHouseholdLeaderboard` em `src/hooks/use-weekly-challenges.ts`, que também lista todos os perfis do household sem filtrar.

| Ficheiro | Acção |
|---|---|
| `src/hooks/use-weekly-challenges.ts` | Na função `useHouseholdLeaderboard`, filtrar perfis para incluir apenas `child`/`teen` |

Impacto: apenas filtragem client-side, sem alterações de schema ou RLS.

