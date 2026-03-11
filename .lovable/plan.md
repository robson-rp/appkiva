

## Plano: Tornar a página ParentTasks responsiva

### Problemas identificados

1. **Hero header** — os botões "IA" e "Nova Tarefa" ficam apertados em mobile; o layout `flex-row` não quebra bem
2. **Cards de tarefas** — a linha de acções (aprovar/editar/eliminar) e a badge de estado ficam comprimidas; o layout interior não se adapta a ecrãs estreitos
3. **Diálogos** — os `DialogContent` não têm `max-w-[95vw]` para mobile
4. **Linha de acções no card** — em mobile, os botões e badge ficam sobrepostos porque o `flex` não quebra

### Alterações em `src/pages/parent/ParentTasks.tsx`

| Zona | Linha(s) | Alteração |
|---|---|---|
| Hero botões | 153 | Adicionar `flex-wrap` para os botões quebrarem linha em ecrãs pequenos |
| Hero botões IA | 161 | Mostrar texto completo — remover `hidden xs:inline` e truncar melhor |
| Card layout acções | 326 | Mudar para `flex-col sm:flex-row` e alinhar botões em coluna no mobile |
| Card acções | 331 | Adicionar `w-full sm:w-auto sm:ml-auto` + `flex-wrap` nos botões |
| Approve button | 334-340 | Adicionar `flex-1 sm:flex-none` para o botão ocupar largura total em mobile |
| Dialog Create | 169 | Adicionar `max-w-[95vw]` ao `DialogContent` |
| Dialog Edit | 401 | Adicionar `max-w-[95vw]` ao `DialogContent` |
| Dialog AI | 441 | Já tem `max-w-md`, adicionar `max-w-[95vw]` como fallback |
| Alert Dialog | 370 | Adicionar `max-w-[95vw]` ao `AlertDialogContent` |

### Resumo
Ajustes de flexbox e larguras máximas nos diálogos para garantir que todos os elementos se adaptam a viewports móveis sem overflow ou sobreposição.

