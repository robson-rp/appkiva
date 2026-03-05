

## Plano: Histórico de Metas Concluídas por Turma

### O que muda

Adicionar um campo `completedAt` ao tipo `ClassGoal` e uma secção de "Histórico" em cada card de turma que lista as metas concluídas com a respetiva data.

### Alterações em `src/pages/teacher/TeacherClasses.tsx`

1. **Tipo `ClassGoal`** — adicionar `completedAt?: string` ao tipo.

2. **Dados iniciais** — sem alteração (metas iniciais não têm `completedAt`).

3. **Registar data de conclusão** — em `toggleGoalComplete` e `updateGoalCurrent`, quando `completed` passa a `true`, gravar `completedAt: new Date().toISOString()`. Quando desmarcada, limpar o campo.

4. **Nova secção "Histórico"** — abaixo das metas ativas de cada turma, mostrar as metas com `completed === true` numa lista compacta com:
   - Ícone da categoria + título
   - Badge "Concluída" verde
   - Data formatada (ex: "05/03/2026") usando `date-fns` `format`
   - Botão de eliminar (já existente)

5. **Import** — adicionar `import { format } from 'date-fns'` e ícone `History` do lucide-react.

### Resumo visual

Cada card de turma terá:
- Metas ativas (como está)
- Separador "📜 Histórico" com lista das concluídas + datas

