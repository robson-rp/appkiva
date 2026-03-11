

## Plano: Acelerar abertura das páginas internas

### Diagnóstico
O hook `usePrefetchRoutes` existe mas só é usado no `ChildDashboard`. Os portais Teen, Parent, Teacher, Partner e Admin não fazem prefetch — cada navegação dispara um lazy import que causa atraso visível.

### Estratégia (3 frentes)

**1. Activar prefetch em todos os dashboards**

Adicionar `usePrefetchRoutes(role)` nos dashboards que não o têm: `TeenDashboard`, `ParentDashboard`, `TeacherDashboard`, `PartnerDashboard`, `AdminDashboard`.

**2. Expandir o mapa de rotas do prefetch**

Completar `ROUTE_MAP` em `use-prefetch-routes.ts` com as rotas mais visitadas de cada portal:

| Portal | Rotas a pré-carregar |
|---|---|
| child | + ChildVaults, ChildStore, ChildAchievements |
| teen | + TeenVaults, TeenAnalytics, LearnPage |
| parent | + ParentDashboard (já eager), ParentAllowance, ParentRewards, ParentMissions, ParentVaults |
| teacher | TeacherClasses, TeacherChallenges |
| partner | PartnerPrograms, PartnerChallenges, PartnerReports |
| admin | AdminUsers, AdminTenants, AdminSubscriptions, AdminFinance |

**3. Prefetch on hover nos links de navegação**

Adicionar ao componente `NavLink` um `onMouseEnter`/`onFocus` que importa a página destino antes do clique, usando um mapa de path→loader. Isto dá ~200-400ms de avanço para que ao clicar o chunk já esteja em cache.

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `src/hooks/use-prefetch-routes.ts` | Expandir `ROUTE_MAP` com todos os portais; exportar `prefetchByPath()` para uso no hover |
| `src/pages/teen/TeenDashboard.tsx` | Adicionar `usePrefetchRoutes('teen')` |
| `src/pages/parent/ParentDashboard.tsx` | Adicionar `usePrefetchRoutes('parent')` |
| `src/pages/teacher/TeacherDashboard.tsx` | Adicionar `usePrefetchRoutes('teacher')` |
| `src/pages/partner/PartnerDashboard.tsx` | Adicionar `usePrefetchRoutes('partner')` |
| `src/pages/admin/AdminDashboard.tsx` | Adicionar `usePrefetchRoutes('admin')` |
| `src/components/NavLink.tsx` | Adicionar `onMouseEnter`/`onFocus` que chama `prefetchByPath(href)` |

### Impacto
Após o dashboard carregar, todas as páginas adjacentes começam a ser importadas em idle time. Adicionalmente, ao passar o rato sobre qualquer link de navegação, o chunk é importado imediatamente. O resultado é navegação praticamente instantânea entre páginas internas.

