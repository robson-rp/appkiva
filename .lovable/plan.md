

## Plano: Menu "Mais" (⋯) na navegação inferior

Adicionar um 5.º item "Mais" com ícone `MoreHorizontal` na barra de navegação inferior de criança e adolescente. Ao tocar, abre um painel (sheet/drawer) com as funcionalidades extra.

### Funcionalidades no menu "Mais"

**Criança:**
- Cofres (`/child/vaults` — PiggyBank)
- Sonhos (`/child/dreams` — Sparkles)
- Missões (`/child/missions` — Target)
- Diário (`/child/diary` — BookOpen)
- Conquistas (`/child/achievements` — Trophy)
- Badges (`/child/badges` — Award)
- Streaks (`/child/streaks` — Flame)

**Adolescente:**
- Cofres (`/teen/vaults` — PiggyBank) — já existe na nav, move para cá
- Missões (`/teen/missions` — Target)
- Analytics (`/teen/analytics` — BarChart3)
- Badges (`/teen/badges` — Award)
- Streaks (`/teen/streaks` — Flame)

### Alterações

1. **`src/components/layouts/ChildLayout.tsx`**
   - Reduzir `bottomNavItems` para 4 itens fixos: Início, Carteira, Tarefas, Aprender
   - Adicionar um 5.º botão "Mais" (`MoreHorizontal`) que abre um `Sheet` (vaul drawer) com grid de ícones para as páginas extra
   - Cada item do menu mostra ícone + label, navega ao tocar e fecha o sheet
   - Itens bloqueados por feature gate mostram cadeado

2. **`src/components/layouts/TeenLayout.tsx`**
   - Mesma abordagem: 4 itens fixos (Início, Carteira, Tarefas, Aprender) + botão "Mais"
   - Sheet com Cofres, Missões, Analytics, Badges, Streaks

3. **UX do Sheet**
   - Drawer de baixo para cima (componente `Sheet` existente com `side="bottom"`)
   - Grid 3×N de ícones grandes com labels
   - Animação framer-motion no conteúdo
   - Indicador visual se a rota atual está dentro do menu "Mais" (dot no ícone ⋯)

