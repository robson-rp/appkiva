

## Plano: Motor Comportamental Central — KIVARA

### Análise do estado actual

O projecto já tem os blocos fundamentais implementados:
- **Streaks**: tabelas `streaks`/`streak_activities`/`streak_reward_claims`, widget visual, RPC `record_daily_activity`
- **Missões inteligentes**: Edge Function `generate-missions` com IA (Gemini Flash), `complete-mission` com recompensa atómica
- **Ligas semanais**: `LeagueBadge` com tiers Bronze→Diamante baseado em pontos semanais
- **Metas de poupança**: `dream_vaults` com depósitos/levantamentos via ledger
- **Recompensas visuais**: `RewardAnimationContext` (CoinFly + XPGainToast), `LevelUpCeremony`, `ConfettiCelebration`
- **Notificações**: motor `notification-engine` com throttling, nudges de streak às 16:00
- **Rankings**: familiar (household) e colegas (classmates)
- **KivaPoints**: hook `useKivaPoints` soma de lições + missões + streaks
- **XP/Nível**: `XPProgressBar`, `PlayerCard`, `LEVEL_CONFIG` (5 níveis)
- **Admin**: painel de missões com templates e analytics

**O que falta**: um componente central "Today's Loop" no dashboard que unifique tudo numa experiência coerente, nudges comportamentais inteligentes conectados a metas, cálculo dinâmico do nível real, e surprise rewards.

---

### Implementação

#### 1. Dashboard "Today's Loop" — Componente central

Novo componente `TodayLoop.tsx` que mostra o ciclo diário numa única card no topo do dashboard:

- **Missão do dia** (primeira missão diária disponível) com botão rápido
- **Streak actual** com indicador visual
- **Liga semanal** com posição e FXP da semana
- **Meta mais próxima** com barra de progresso
- **Próxima recompensa** (streak milestone ou nível)

Este componente substitui a disposição actual de widgets separados por um fluxo visual coerente.

#### 2. Nível dinâmico real

O `childLevel` está hardcoded como `'saver'` (linha 65 do ChildDashboard). Corrigir para calcular o nível real baseado nos KivaPoints acumulados, usando `LEVEL_CONFIG.minPoints`.

#### 3. XPProgressBar com dados reais

Actualmente usa `streakData.totalActiveDays * 15`. Actualizar para usar `useKivaPoints()`.

#### 4. Nudge System — Componente de motivação

Novo componente `BehaviorNudge.tsx` que analisa o contexto actual e mostra uma mensagem motivacional contextual:

- Streak em risco → "Faz uma missão para manter a tua sequência!"
- Perto do top 3 na liga → "Estás a X FXP do pódio!"
- Perto de milestone de poupança → "Mais X moedas e atinges a meta!"
- Inactivo → "Bem-vindo de volta! Completa uma missão para bónus!"
- Nenhum → dica do Kivo aleatória

#### 5. Surprise Rewards

Adicionar lógica ao `complete-mission` para ocasionalmente (10% chance) dar bónus surpresa. O frontend mostra animação especial "Kivo Bonus! 🎁".

#### 6. Goal-linked missions no generate-missions

Actualizar a edge function para incluir metas de poupança activas (`dream_vaults`) no contexto enviado à IA, para que gere missões do tipo "Adiciona X moedas à tua meta [nome]".

---

### Ficheiros

| Ficheiro | Acção |
|---|---|
| `src/components/TodayLoop.tsx` | **Novo** — Card central do ciclo diário |
| `src/components/BehaviorNudge.tsx` | **Novo** — Mensagens motivacionais contextuais |
| `src/pages/child/ChildDashboard.tsx` | Integrar TodayLoop + BehaviorNudge, calcular nível dinâmico, reordenar widgets |
| `src/components/XPProgressBar.tsx` | Usar `useKivaPoints()` em vez de cálculo aproximado |
| `supabase/functions/generate-missions/index.ts` | Adicionar dream_vaults ao contexto IA |
| `supabase/functions/complete-mission/index.ts` | Adicionar lógica de surprise reward (10%) |
| `src/i18n/pt.ts` + `src/i18n/en.ts` | Novas chaves para nudges e today loop |

### Detalhes técnicos

- **TodayLoop** usa hooks existentes: `useChildMissions`, `useStreakData`, `useKivaPoints`, `useDreamVaults`, `getLeagueTier`
- **BehaviorNudge** é stateless, calcula a mensagem a partir dos dados já carregados no dashboard (zero queries extra)
- **Nível dinâmico**: `const childLevel = levels.reverse().find(l => kivaPoints >= LEVEL_CONFIG[l].minPoints) ?? 'apprentice'`
- **Surprise reward**: no `complete-mission`, após inserir ledger entry, `if (Math.random() < 0.1)` inserir bónus extra com `idempotency_key: mission-bonus-{id}`

