

# Ajustar animações hover nos stat cards do ChildDashboard

Os 3 cards de stats (Tarefas, Missões, Cofres) na linha 134 têm `whileHover={{ scale: 1.03 }}` e `whileTap={{ scale: 0.97 }}` — valores exagerados para cards pequenos.

## Alteração

**`src/pages/child/ChildDashboard.tsx`** (linha 134):
- Reduzir `whileHover` de `scale: 1.03` para `scale: 1.01`
- Reduzir `whileTap` de `scale: 0.97` para `scale: 0.99`

Isto mantém o feedback visual subtil sem o efeito exagerado actual.

