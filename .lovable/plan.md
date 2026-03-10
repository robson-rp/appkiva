

## Plano: Adicionar chaves de tradução em falta

### Problema

Várias chaves i18n estão a ser usadas no código mas não existem nos dicionários `pt.ts` e `en.ts`, resultando na exibição do texto da chave (ex: `challenges.no_challenges`) em vez do texto traduzido.

### Chaves em falta

| Chave | Ficheiro que usa | PT | EN |
|---|---|---|---|
| `challenges.no_challenges` | `WeeklyChallenges.tsx` | Ainda não há desafios semanais. Volta em breve! | No weekly challenges yet. Check back soon! |
| `ranking.no_siblings` | `ChildRanking.tsx` | Ainda sem rankings entre irmãos | No sibling rankings yet |
| `ranking.classmates_coming_soon` | `ChildRanking.tsx` | Rankings de colegas em breve | Classmate rankings coming soon |
| `teacher.dashboard.no_students` | `TeacherDashboard.tsx` | Ainda sem alunos nas turmas | No students in classes yet |

### Alterações

| Ficheiro | Alteração |
|---|---|
| `src/i18n/pt.ts` | Adicionar 4 chaves na secção correspondente |
| `src/i18n/en.ts` | Adicionar 4 chaves na secção correspondente |
| `src/components/WeeklyChallenges.tsx` | Remover o fallback `?? '...'` (já desnecessário) |
| `src/pages/child/ChildRanking.tsx` | Remover o fallback `?? '...'` |
| `src/pages/teacher/TeacherDashboard.tsx` | Remover o fallback `?? '...'` |

Impacto: zero breaking changes, apenas adição de traduções e limpeza de fallbacks.

