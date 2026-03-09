

# Audit: Páginas e funcionalidades ainda com dados mock

## Resumo

**Não, nem todas as funcionalidades estão operacionais com dados reais.** Existe ainda uma quantidade significativa de páginas e componentes que dependem de dados mock estáticos do ficheiro `src/data/mock-data.ts` e outros ficheiros de dados simulados. Abaixo está o inventário completo.

---

## Páginas e componentes com dados MOCK (não operacionais)

### Criança
| Página/Componente | Dados mock usados | Impacto |
|---|---|---|
| `ChildDreams.tsx` | `mockDreamVaults`, `mockChildren` | Fallback para sonhos mock se BD vazia |
| `ChildRanking.tsx` | `mockChildren`, `mockVaults`, `mockDonations`, `mockClassLeaderboard`, `mockFriendsLeaderboard` | Rankings totalmente mock |
| `ChildStore.tsx` | Provavelmente mock (precisa confirmar) | Loja de recompensas |
| `ChildAchievements.tsx` | `mockAchievements` (via `mock-data.ts`) | Conquistas estáticas |
| `ChildFamilyRankings.tsx` (componente) | `mockChildren`, `mockVaults`, `mockDonations` | Widget do dashboard com dados falsos |
| `ChildAchievementsStrip.tsx` | `mockAchievements` (via dashboard) | Strip de conquistas no dashboard |

### Adolescente
| Página/Componente | Dados mock usados | Impacto |
|---|---|---|
| `TeenDashboard.tsx` | `mockTeens`, `mockTeenTransactions` | Dashboard inteiro usa teen mock para nível, XP, transações |

### Professor
| Página/Componente | Dados mock usados | Impacto |
|---|---|---|
| `TeacherStudentProfile.tsx` | `mockChildren`, `mockLeaderboard`, `mockTasks`, `mockTransactions`, `mockVaults`, `mockAchievements` | Perfil do aluno 100% mock |
| `TeacherChallenges.tsx` | `mockChallenges`, `mockClassrooms` | Desafios coletivos 100% mock |
| `TeacherLayout.tsx` | `mockChallenges` | Badge de desafios urgentes no sidebar |

### Parceiro
| Página/Componente | Dados mock usados | Impacto |
|---|---|---|
| (Parceiro parece migrado para BD) | — | OK |

### Componentes partilhados
| Componente | Dados mock usados | Impacto |
|---|---|---|
| `BadgesPage.tsx` | `mockBadges` | Página de badges 100% mock |
| `StreaksPage.tsx` | `mockStreakData` (fallback) | Fallback se BD vazia |
| `WeeklyChallenges.tsx` | `mockWeeklyChallenges`, `mockClassLeaderboard`, `mockFriendsLeaderboard` | Desafios semanais 100% mock |
| `XPProgressBar.tsx` | `mockChildren`, `mockTeens` | Barra de XP usa dados estáticos |
| `StreakWidget.tsx` | `mockStreakData` (fallback) | Fallback se BD vazia |

---

## Páginas já operacionais com dados reais
- **Criança**: Dashboard (parcial), Wallet, Tasks, Missions, Vaults, Diary, Profile
- **Encarregado**: Dashboard, Children, Tasks, Missions, Allowance, Rewards, Vaults, Reports, Profile, Subscription
- **Professor**: Dashboard, Classes (CRUD turmas/alunos)
- **Parceiro**: Dashboard, Programs, Challenges, Reports, Profile, Subscription
- **Admin**: Todas as páginas administrativas

---

## Plano de migração (priorizado)

### 1. Badges/Conquistas → tabela `badges` + `badge_progress`
Criar tabelas para definição de badges e progresso por perfil. Substituir `mockBadges` e `mockAchievements` em `BadgesPage`, `ChildAchievements`, `ChildDashboard`.

### 2. Rankings familiares → queries reais
Substituir `ChildFamilyRankings` e `ChildRanking` para usar dados do household real (saldos de wallets, vaults, doações).

### 3. TeenDashboard → dados reais
Remover `mockTeens` e `mockTeenTransactions`, usar hooks existentes (`useWalletBalance`, `useWalletTransactions`, `useStreakData`).

### 4. Desafios semanais → tabela `weekly_challenges`
Criar tabela e migrar `WeeklyChallenges.tsx` e leaderboards.

### 5. TeacherStudentProfile → queries reais
Usar hooks existentes para buscar dados reais do aluno (wallet, tasks, vaults, achievements).

### 6. TeacherChallenges → queries reais
Migrar `mockChallenges` para tabela de desafios coletivos com gestão real.

### 7. XPProgressBar → dados reais
Usar streak/kiva points do perfil autenticado em vez de mock.

### 8. Loja de recompensas (ChildStore) → verificar estado actual

---

## Estimativa de esforço
Migração completa: ~8-10 etapas de implementação. Recomendo priorizar por role (Teen Dashboard primeiro por ser rápido, depois Badges que afeta múltiplas páginas).

