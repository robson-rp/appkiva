# Plano: Arquitectura Funcional Completa da Plataforma KIVARA

## Situacao Actual

A plataforma ja tem implementado (com UI/mock):

- Carteira virtual com historico de transacoes
- Tarefas com aprovacao parental
- Missoes financeiras semanais
- Cofres de poupanca com metas e progresso
- Loja virtual com compras
- Dashboard do encarregado com relatorios e graficos
- Mesada configuravel por crianca
- Sistema de niveis e conquistas
- Mascote Kivo com dicas contextuais
- Convites por codigo (mock)

## Funcionalidades Novas a Implementar

Organizadas por prioridade e complexidade, em 4 fases:

---

### FASE 1 — Enriquecimento da Conta da Crianca

**1.1 Renomear moeda para** KivaraCoins

**1.2 Juros Simulados nos Cofres**

- Adicionar campo `interestRate` ao tipo `Vault` (default 1%/mes)
- Mostrar juros acumulados e projecao no card de cada cofre
- Indicador visual "+X moedas este mes" com animacao

**1.3 Sistema de Doacoes**

- Novo tipo `Donation` e mock data com causas (educativas, solidarias)
- Nova seccao na Carteira: botao "Doar" com seleccao de causa e montante
- Novo tipo de transacao `donated`
- Card de impacto: "Ja doaste X moedas para Y causas"

**1.4 Avatar Evolutivo**

- Expandir o sistema de niveis com avatares visuais por nivel
- Mostrar evolucao do avatar no dashboard da crianca
- Animacao de transicao ao subir de nivel

**1.5 Rankings Familiares**

- Nova seccao no ChildDashboard: "Ranking Familiar"
- Categorias: Melhor Poupador, Melhor Planeador, Maior Doador
- Cards animados com posicao e pontuacao

---

### FASE 2 — Enriquecimento da Conta do Encarregado

**2.1 Limites de Gasto**

- Novo painel em ParentChildren: definir minimo de poupanca, limite semanal, bloqueio de compras
- Indicadores visuais no dashboard da crianca quando limites estao activos

**2.2 Mesada Inteligente (Variavel)**

- Expandir ParentAllowance: mesada base + bonus por tarefas + bonus por missoes
- Configuracao: semanal vs mensal
- Resumo visual da composicao da mesada

**2.3 Metas Partilhadas**

- Novo tipo `SharedGoal` com contribuicoes de pai e crianca
- Pagina/seccao partilhada visivel em ambos os dashboards
- Progress bar com contribuicoes separadas por cor

**2.4 Relatorios Educativos Avancados**

- Adicionar insights automaticos: tendencia de poupanca, impulsividade, consistencia
- Cards de "alerta" quando comportamento muda
- Comparacao entre periodos

---

### FASE 3 — Novas Funcionalidades de Engajamento

**3.1 Diario Financeiro**

- Nova pagina `/child/diary`
- Crianca escreve reflexoes: "Hoje poupei porque..."
- Lista cronologica com emojis de humor
- Contador de dias consecutivos

**3.2 Cofre dos Sonhos**

- Evolucao dos cofres: crianca regista sonhos e planos com descricao longa
- Pais podem comentar e encorajar
- Visualizacao tipo "vision board" com imagens/emojis

**3.3 Recompensas Definidas pelos Pais na Loja**

- Pais criam itens customizados na loja (ex: "Ida ao cinema", "1h extra de jogo")
- Novo CRUD em ParentChildren ou nova pagina ParentStore

---

### FASE 4 — Modo Escolar

**4.1 Portal Escolar (nova area)**

- Novo role `teacher` no AuthContext
- Layout dedicado para professores
- Rotas: `/school`, `/school/classes`, `/school/challenges`, `/school/reports`

**4.2 Gestao de Turmas**

- Criar turmas, adicionar criancas
- Desafios colectivos por turma

**4.3 Rankings e Relatorios Escolares**

- Rankings por turma/escola
- Relatorios pedagogicos para professores

---

## Abordagem Tecnica

- **Tudo UI/mock** — sem backend, dados em `mock-data.ts` e estado local React
- **Tipos primeiro** — actualizar `kivara.ts` com novos interfaces antes de criar UI
- **Navegacao** — novas rotas no `App.tsx`, novos links nos layouts
- **Estilo consistente** — manter glassmorphism, framer-motion stagger, gradient-kivara

## Recomendacao

Implementar por fases, comecando pela Fase 1 (maior impacto na experiencia da crianca). Cada fase pode ser dividida em mensagens individuais para manter qualidade e controlo.

Qual fase preferes comecar?