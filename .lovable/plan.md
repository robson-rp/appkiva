

# Melhorar Responsividade das Páginas do Professor

## Problemas Identificados

Após análise das 5 páginas do professor (Dashboard, Classes, Challenges, School Profile, Profile), os principais problemas de responsividade são:

1. **TeacherDashboard**: Gráficos (BarChart/RadarChart) com altura fixa de 288px (`h-72`) que podem ser excessivos em mobile; tabela de comparação de turmas sem scroll horizontal adequado; cards de leaderboard com texto que pode truncar
2. **TeacherClasses**: Diálogos de criação/edição com `max-w-lg` que funcionam mas o conteúdo interno (grid de ícones, lista de alunos) pode ficar apertado; cards de turma com botões de ação que podem sobrepor
3. **TeacherChallenges**: Tabs com texto escondido em mobile (`hidden xs:inline`) -- bom, mas os cards de desafio têm `w-14 h-14` ícones que ocupam muito espaço em ecrãs pequenos; contribuições em `flex-wrap` podem acumular
4. **TeacherSchoolProfile**: Largura limitada a `max-w-3xl` -- adequado
5. **TeacherProfile**: Largura limitada a `max-w-md` -- adequado

## Plano de Implementação

### 1. TeacherDashboard - Gráficos e Tabela
- Reduzir altura dos gráficos em mobile: `h-52 sm:h-72`
- Garantir que a tabela de comparação tem `overflow-x-auto` com `min-w` nas colunas
- Reduzir padding do hero em mobile
- Tornar o ranking de alunos mais compacto em mobile (avatar menor, texto condensado)
- Adicionar `text-xs sm:text-sm` nos textos do leaderboard

### 2. TeacherClasses - Cards de Turma
- Melhorar layout dos botões de ação nos cards (empilhar verticalmente em mobile)
- Garantir que o grid de metas dentro de cada turma não quebra o layout
- Ajustar diálogos para serem mais mobile-friendly com `max-w-[95vw] sm:max-w-lg`

### 3. TeacherChallenges - Cards de Desafio
- Reduzir tamanho do ícone do desafio em mobile: `w-10 h-10 sm:w-14 sm:h-14 text-2xl sm:text-3xl`
- Melhorar a secção de datas/recompensas com `flex-wrap` adequado
- Garantir que os botões edit/delete têm zonas tácteis de 44px

### 4. TeacherLayout - Ajustes Gerais
- Verificar padding do `main` content area para não haver overflow horizontal

### Ficheiros a Modificar
- `src/pages/teacher/TeacherDashboard.tsx`
- `src/pages/teacher/TeacherClasses.tsx`
- `src/pages/teacher/TeacherChallenges.tsx`

Sem alterações necessárias em TeacherProfile e TeacherSchoolProfile (já estão bem dimensionados).

