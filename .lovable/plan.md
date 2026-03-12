

## Plano: Melhorar Responsividade da Página Tarefas (Parent)

### Problemas Identificados (390px)

1. **Hero**: Os dois botões (IA + Nova Tarefa) podem ficar apertados; o texto `text-[10px]` do label "GESTÃO DE TAREFAS" é demasiado pequeno.
2. **Stats grid**: Labels com `text-[10px]` abaixo do floor tipográfico de 14px.
3. **Task cards**: Layout complexo com avatar + título + badges + descrição + ações numa estrutura horizontal que fica demasiado apertada; os botões de ação (Aprovar, Editar, Eliminar) ficam espremidos.
4. **Badges de recorrência e categoria**: Usam `text-[9px]` e `text-caption` que, mesmo após o bump, podem truncar no mobile.

### Alterações em `src/pages/parent/ParentTasks.tsx`

**1. Hero — botões em stack vertical no mobile**
- Mudar `flex flex-wrap` → `flex flex-col sm:flex-row` nos botões para empilharem verticalmente em mobile.
- Subir o label "GESTÃO DE TAREFAS" de `text-[10px]` → `text-xs`.

**2. Stats grid — labels legíveis**
- Mudar labels de `text-[10px]` → `text-xs` para respeitar o floor de 14px.

**3. Task cards — layout mobile-first**
- Separar a secção de ações: em mobile, os botões (Aprovar/Editar/Eliminar) ocupam largura total abaixo do conteúdo em vez de ficarem inline.
- Garantir que os botões de ação têm `min-h-[44px]` no mobile.
- O botão "Aprovar" fica `w-full` no mobile (já tem `flex-1 sm:flex-none` mas precisa de `w-full sm:w-auto`).
- Os icon buttons (Editar, Eliminar) ficam lado a lado com tamanho `h-11 w-11` no mobile.

**4. Badges — tamanhos mínimos**
- Badge de recorrência: `text-[9px]` → `text-xs`.
- Badge de categoria inline: `text-caption` já está OK (14px após bump).

**5. AI Suggestions dialog — badge reward**
- `text-[10px]` → `text-xs`.

### Resultado
Todos os elementos interactivos cumprem os 44px de touch target, todos os textos ≥ 14px, e o layout adapta-se correctamente a 390px sem overflow horizontal.

