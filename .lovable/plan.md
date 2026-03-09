

# Plano: Tela 7 — Ranking Dedicado

## Situação Actual

Já existem dois componentes de ranking separados:
- `ChildFamilyRankings` — ranking entre irmãos (poupança, KivaPoints, doações) no dashboard da criança
- `WeeklyChallenges` — ranking entre colegas/amigos com filtro turma/amigos, incluindo pódio visual

Falta uma **página dedicada** `/child/ranking` que unifique ambas as visões numa tela única e coesa.

---

## O que será construído

Uma nova página `ChildRanking` com duas tabs:

| Tab | Conteúdo |
|-----|----------|
| **Irmãos** | Ranking familiar expandido (poupança, tarefas, KivaPoints) com pódio e posição do utilizador |
| **Colegas** | Ranking da turma e amigos (reutiliza dados de `mockClassLeaderboard` / `mockFriendsLeaderboard`) com sub-filtro turma/amigos |

Cada tab terá:
- Pódio visual (top 3) com medalhas
- Lista completa ordenada
- Destaque do utilizador actual
- Categorias de mérito (melhor poupador, mais tarefas, etc.)

---

## Ficheiros a criar/modificar

| Acção | Ficheiro | Detalhe |
|-------|---------|---------|
| **Criar** | `src/pages/child/ChildRanking.tsx` | Página com tabs Irmãos/Colegas, pódio e lista |
| **Modificar** | `src/App.tsx` | Adicionar rota `/child/ranking` |
| **Modificar** | `src/components/layouts/ChildLayout.tsx` | Adicionar item "Ranking" ao menu (ícone Trophy) |
| **Modificar** | `src/i18n/pt.ts` + `en.ts` | Traduções para título, tabs e labels |

A página reutiliza os dados mock existentes (`mockChildren`, `mockClassLeaderboard`, `mockFriendsLeaderboard`) e os componentes visuais de pódio/medalhas já definidos em `WeeklyChallenges`.

