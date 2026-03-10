

## Plano: Sugestões de Missões via IA + Outras Automações

### 1. Sugestões de Missões com IA (prioridade)

Replicar o padrão já existente em `suggest-tasks` para missões.

**Alterações:**

| Ficheiro | Acção |
|---|---|
| `supabase/functions/suggest-missions/index.ts` | Nova edge function que usa Lovable AI (Gemini 3 Flash) com tool calling para retornar 4-5 missões estruturadas (título, descrição, tipo, recompensa, kivaPoints, meta) |
| `src/pages/parent/ParentMissions.tsx` | Adicionar botão "✨ Sugerir com IA" no header (igual ao ParentTasks), dialog de sugestões, e função `applySuggestion` que preenche o formulário |
| `src/i18n/pt.ts` / `src/i18n/en.ts` | Chaves para "Sugerir com IA", "Carregando sugestões...", etc. |
| `supabase/config.toml` | Registar `suggest-missions` com `verify_jwt = false` |

A edge function recebe `{ childAge, missionType, context }` e devolve sugestões com campos alinhados ao schema da tabela `missions`.

---

### 2. Outras automações viáveis com IA

Além das missões, há vários pontos do sistema que beneficiariam de automação inteligente:

**a) Insights Comportamentais Automáticos** — Edge function `generate-insights` que analisa o histórico de transacções, tarefas concluídas e poupança de uma criança e gera 2-3 insights personalizados (ex: "A Maria poupou 30% mais esta semana" ou "O João não completou tarefas de estudo há 2 semanas"). Mostraria no dashboard do pai.

**b) Resumo Semanal para Pais** — Edge function `weekly-summary` que compila automaticamente: tarefas concluídas, missões em curso, variação de saldo, streak actual. Pode ser mostrado como card no ParentDashboard ou enviado como notificação.

**c) Sugestão de Recompensas Personalizadas** — Com base na idade e interesses da criança, sugerir recompensas adequadas para o catálogo de `ParentRewards`.

**d) Dicas do Kivo Contextuais** — O mascote Kivo já tem dicas estáticas (`kivo-tips.ts`). Poderia ter dicas geradas dinamicamente com base no comportamento recente da criança.

---

### Próximo passo recomendado

Implementar primeiro a **sugestão de missões com IA** (item 1), que é o mais directo e segue exactamente o padrão comprovado do `suggest-tasks`. Os restantes itens podem ser feitos incrementalmente depois.

Queres que avance com a implementação do item 1, ou preferes incluir algum dos outros itens nesta iteração?

