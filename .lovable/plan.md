

## Plano: Completar responsividade e prefetch em toda a plataforma

### 1. Corrigir diálogos sem max-width mobile (~30 diálogos)

Adicionar `max-w-[95vw]` a todos os `DialogContent` e `AlertDialogContent` que não o têm, nos seguintes ficheiros:

| Ficheiro | Diálogos a corrigir |
|---|---|
| `src/pages/admin/AdminTenants.tsx` | 1 DialogContent |
| `src/pages/admin/AdminCompliance.tsx` | 1 DialogContent |
| `src/pages/admin/AdminSubscriptions.tsx` | 2 AlertDialogContent |
| `src/pages/admin/AdminCurrencies.tsx` | 3 DialogContent |
| `src/pages/admin/AdminSchools.tsx` | 2 DialogContent |
| `src/pages/admin/AdminBanners.tsx` | 1 DialogContent |
| `src/pages/child/ChildVaults.tsx` | 3 DialogContent |
| `src/pages/child/ChildDreams.tsx` | 2 DialogContent |
| `src/pages/child/ChildWallet.tsx` | 1 DialogContent |
| `src/pages/teen/TeenVaults.tsx` | 3 DialogContent + 1 AlertDialogContent |
| `src/pages/parent/ParentRewards.tsx` | 1 DialogContent |
| `src/pages/parent/ParentVaults.tsx` | 2 DialogContent + 1 AlertDialogContent |
| `src/pages/parent/ParentAllowance.tsx` | 1 DialogContent |
| `src/pages/parent/ParentMissions.tsx` | 2 DialogContent + 1 AlertDialogContent |
| `src/pages/parent/ParentChildren.tsx` | 4 DialogContent + 1 AlertDialogContent |
| `src/pages/teacher/TeacherClasses.tsx` | 1 DialogContent + 1 AlertDialogContent |

Padrão: `<DialogContent>` → `<DialogContent className="max-w-[95vw] sm:max-w-lg">` e `<DialogContent className="sm:max-w-md">` → `<DialogContent className="max-w-[95vw] sm:max-w-md">`

### 2. Expandir prefetch para todas as rotas admin

Actualizar `src/hooks/use-prefetch-routes.ts`:

- Adicionar ao `ROUTE_MAP.admin`: AdminSchools, AdminBanners, AdminMissions, AdminLessons, AdminCurrencies, AdminCompliance, AdminAuthSecurity, AdminRisk, AdminAudit, AdminNotifications, AdminOnboarding
- Adicionar ao `PATH_LOADERS`: as 12 rotas admin em falta (`/admin/schools`, `/admin/banners`, `/admin/missions`, etc.)
- Adicionar rotas parent em falta: `/parent/consent`, `/parent/support`

### 3. Ficheiros a alterar

- `src/hooks/use-prefetch-routes.ts` — expandir ROUTE_MAP e PATH_LOADERS
- 16 ficheiros de páginas — adicionar `max-w-[95vw]` aos diálogos

### Impacto
- Todos os diálogos ficam utilizáveis em mobile sem overflow horizontal
- Todas as páginas admin ficam com prefetch, eliminando atrasos de navegação no painel de administração

