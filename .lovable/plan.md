

## Plano: Três melhorias — Escola individual, Pontos no perfil, Ranking de colegas

O utilizador levantou três questões distintas. Vou abordá-las separadamente.

---

### 1. Atribuição de escola individual por criança

**Problema actual**: O campo `school_tenant_id` está na tabela `profiles` e é definido no perfil do pai. Todas as crianças do household herdam implicitamente a mesma escola.

**Solução**: Adicionar `school_tenant_id` à tabela `children`, permitindo que cada criança tenha a sua escola atribuída individualmente. O professor continua a adicionar alunos via `classroom_students`.

| Acção | Detalhe |
|---|---|
| **Migração DB** | `ALTER TABLE children ADD COLUMN school_tenant_id uuid REFERENCES tenants(id);` |
| **ParentChildren.tsx** | No formulário de edição/criação de criança, adicionar selector de escola (dropdown de tenants com tipo escola) |
| **EditChildDialog.tsx** | Adicionar campo escola ao diálogo de edição |
| **use-children.ts** | Incluir `school_tenant_id` nas queries e mutations |

---

### 2. Como os pontos e KVC ganhos reflectem no perfil da criança

**Problema actual**: No `ChildDashboard`, o `childKivaPoints` é calculado de forma aproximada: `streakData.totalActiveDays * 15`. Não soma os KivaPoints reais ganhos em missões (`kiva_points_reward`), tarefas, lições concluídas ou desafios.

O saldo KVC (KivaCoins) já está correcto — vem da `wallet_balances` via `useWalletBalance`. Mas os **KivaPoints** (pontos de XP/gamificação) não são acumulados de forma centralizada.

**Solução**: Criar uma query que soma KivaPoints de todas as fontes:
- `lesson_progress.kiva_points_earned`
- Missões concluídas: `missions.kiva_points_reward` (where status = 'completed')
- Streaks reclamados: `streak_rewards.kiva_points`
- Desafios colectivos concluídos (se aplicável)

| Acção | Detalhe |
|---|---|
| **Novo hook** `use-kiva-points.ts` | Query que soma pontos de `lesson_progress`, `missions` (completed), `streak_rewards` |
| **ChildDashboard.tsx** | Substituir o cálculo aproximado por `useKivaPoints()` |
| **PlayerCard** | Já recebe `points` como prop — passará o valor real |

---

### 3. Ranking de colegas de turma (ClassmatesTab)

**Problema actual**: O `ClassmatesTab` no `ChildRanking.tsx` é um placeholder estático ("Em breve"). Os irmãos já estão correctamente filtrados (apenas child/teen). Falta implementar o ranking de colegas da mesma turma.

**Solução**: Criar hook `useClassmateRankings` que:
1. Busca turmas onde a criança está inscrita (`classroom_students`)
2. Busca os outros alunos dessas turmas
3. Para cada aluno, busca saldo da wallet e pontos
4. Ordena e devolve o ranking

| Acção | Detalhe |
|---|---|
| **Novo hook** `use-classmate-rankings.ts` | Query: turmas do aluno → colegas → wallets/pontos |
| **ChildRanking.tsx** | Substituir o placeholder `ClassmatesTab` pelo ranking real usando o novo hook, reutilizando os componentes `Podium` e `LeaderboardList` já existentes |
| **Categorias** | Mesmas do ranking familiar: Poupança, Pontos, Doações |

---

### Resumo de ficheiros

| Ficheiro | Acção |
|---|---|
| Migração SQL | Adicionar `school_tenant_id` à tabela `children` |
| `src/components/EditChildDialog.tsx` | Adicionar selector de escola |
| `src/hooks/use-children.ts` | Incluir `school_tenant_id` |
| `src/hooks/use-kiva-points.ts` | **Novo** — soma real de KivaPoints |
| `src/pages/child/ChildDashboard.tsx` | Usar `useKivaPoints()` em vez do cálculo aproximado |
| `src/hooks/use-classmate-rankings.ts` | **Novo** — ranking de colegas de turma |
| `src/pages/child/ChildRanking.tsx` | Implementar `ClassmatesTab` com dados reais |

