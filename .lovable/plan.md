

## Plano: Corrigir navegação de tarefas para criança e adolescente

### Problema
- A gestão de tarefas existe em `/child/missions` (tab "Tarefas"), mas não há acesso direto na barra de navegação inferior.
- Links no dashboard e no componente `ChildPendingTasks` apontam para `/child/wallet` em vez de `/child/missions`.
- O mesmo problema existe para adolescentes.

### Alterações

1. **`src/components/layouts/ChildLayout.tsx`** — Adicionar item "Missões" à barra de navegação inferior com ícone `Target` e URL `/child/missions`.

2. **`src/components/layouts/TeenLayout.tsx`** — Adicionar item "Missões" à barra de navegação inferior com ícone `Target` e URL `/teen/missions`.

3. **`src/components/child/ChildPendingTasks.tsx`** — Alterar o link "Ver todas" de `/child/wallet` para `/child/missions`.

4. **`src/pages/child/ChildDashboard.tsx`** — Alterar o stat "Tarefas" de `to: '/child/wallet'` para `to: '/child/missions'`.

