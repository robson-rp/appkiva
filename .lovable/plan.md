

## Plano: Simplificar o Painel do Encarregado

O dashboard está demasiado longo. Vamos remover/mover 3 secções para o tornar mais compacto.

### Alterações

**1. Remover o widget do Plano do Dashboard**
- `src/pages/parent/ParentDashboard.tsx`: Remover o bloco `PlanSummaryWidget` (linhas 174-179) e o import correspondente.

**2. Criar página dedicada para Insights Comportamentais**
- Criar `src/pages/parent/ParentInsights.tsx` — página standalone que reutiliza o componente `ParentInsightsWidget` existente, com acesso aos dados dos filhos via `useChildren`.
- `src/pages/parent/ParentDashboard.tsx`: Remover o bloco `ParentInsightsWidget` (linhas 212-222) e substituir por um card compacto com botão "Ver insights" que navega para `/parent/insights`.

**3. Criar página dedicada para Actividades Recentes**
- Criar `src/pages/parent/ParentActivity.tsx` — página standalone com a lista completa de transações (reutilizando `useHouseholdTransactions` com paginação infinita e botão "Carregar mais").
- `src/pages/parent/ParentDashboard.tsx`: Reduzir o bloco de actividades recentes para mostrar apenas as 4 mais recentes (sem paginação) com link "Ver todas" que navega para `/parent/activity`.

**4. Registar as novas rotas**
- `src/App.tsx`: Adicionar lazy imports para `ParentInsights` e `ParentActivity`, e registar as rotas `/parent/insights` e `/parent/activity`.

**5. Adicionar ao menu de navegação**
- `src/components/layouts/ParentLayout.tsx`: Adicionar "Insights" (icon: `Brain`) e "Actividades" (icon: `Activity`) ao `mobileMoreItems` e `navItems` para ficarem acessíveis na sidebar e no menu "Mais" do mobile.

### Resultado
O dashboard ficará com: Hero → Enviar Mesada → Limite de Emissão → Stats Grid → Streaks dos Filhos → Resumo Semanal → Grid (Filhos + Actividades Recentes compactas). Significativamente mais curto.

