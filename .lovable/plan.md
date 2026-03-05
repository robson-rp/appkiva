

## Plano: Exportar Relatório Comparativo em PDF

### Abordagem

Usar a biblioteca **jsPDF** + **jspdf-autotable** para gerar um PDF client-side com os dados comparativos das turmas e as dicas pedagógicas. Sem necessidade de backend.

### Alterações

**1. Instalar dependência**
- `jspdf` (geração de PDF)
- `jspdf-autotable` (tabelas formatadas no PDF)

**2. `src/pages/teacher/TeacherDashboard.tsx`**

- Importar `jsPDF` e `autoTable`
- Importar ícone `Download` do lucide-react
- Importar `Button` de `@/components/ui/button`
- Adicionar função `exportPDF()` que:
  - Cria documento A4 com título "Relatório Comparativo entre Turmas"
  - Adiciona subtítulo com data atual e nome da escola
  - Gera tabela com colunas: Turma, Alunos, Poupança (%), Pontos (média), Tarefas (média) usando `autoTable`
  - Adiciona secção de dicas pedagógicas por turma (texto corrido)
  - Faz download do ficheiro `relatorio-turmas-YYYY-MM-DD.pdf`
- Adicionar botão "Exportar PDF" no header do card "Comparativo entre Turmas" (ao lado do título), usando o `Button` com variante `outline` e ícone `Download`

### Conteúdo do PDF

```text
┌─────────────────────────────────────┐
│  Relatório Comparativo entre Turmas │
│  Escola Sol Nascente · 05/03/2026   │
├─────────────────────────────────────┤
│  Turma │ Alunos │ Poup. │ Pts │ Tar │
│  ───── │ ────── │ ───── │ ─── │ ─── │
│  ...   │  ...   │  ...  │ ... │ ... │
├─────────────────────────────────────┤
│  Dicas Pedagógicas                  │
│  🌟 Turma A: Excelente poupança...  │
│  ⚠️ Turma B: Poupança baixa...      │
└─────────────────────────────────────┘
```

