

# Plano: Loop Viral, Co-Encarregado e Sistema de Economia

## Análise do Estado Actual

A maioria do sistema de economia descrito (moedas KVC, cofres, níveis, conquistas, rankings, loja, mesada, missões, quizzes) **já está implementada**. O que falta são duas funcionalidades novas:

1. **Co-Encarregado** (segundo guardian no household)
2. **Sistema de Referral / Convites Virais** com recompensas KVC

---

## 1. Co-Encarregado (Premium)

### DB
- Criar tabela `household_guardians` (household_id, profile_id, role: 'primary'|'secondary', invited_by, created_at)
- Adicionar `max_guardians` à tabela `subscription_tiers` (default 1, premium = 2)
- RLS: membros do household podem ver; primário pode inserir/deletar

### Edge Function: `invite-guardian`
- Recebe email do segundo encarregado
- Valida que o plano permite >1 guardian
- Gera código de convite específico para guardian (tabela `family_invite_codes` com metadata `type: 'guardian'`)
- O segundo encarregado regista-se normalmente (papel `parent`) e ao aceitar o convite é ligado ao mesmo household

### UI
- No `ParentChildren.tsx`, secção "Encarregados" visível apenas em planos premium
- Botão "Convidar Encarregado" que abre diálogo com campo de email/partilha
- Lista de guardians actuais com possibilidade de remover

### Acesso
- O co-encarregado herda automaticamente acesso a todas as crianças do household (já funciona via `household_id` nas policies RLS existentes)

---

## 2. Sistema de Referral Viral

### DB
- Criar tabela `referral_codes` (id, profile_id, code TEXT UNIQUE, created_at)
- Criar tabela `referral_claims` (id, referral_code_id, referred_profile_id, bonus_awarded BOOLEAN, created_at)
- Cada utilizador recebe um código permanente ao criar perfil (trigger)

### Edge Function: `claim-referral`
- Valida código, associa o novo utilizador, e credita KVC ao referrer (ex: 100 KVC)
- Bónus escalonado: 3 amigos = 100 KVC extra (milestone)

### UI — Todos os perfis
- Secção "Convidar Amigos" no perfil de cada utilizador
- Código pessoal + botões de partilha (copiar, WhatsApp, link)
- Contador de convites aceites e KVC ganhas
- No registo, campo opcional "Código de quem te convidou"

### Desafios Sociais (Crianças)
- Novo tipo de missão `social` nas weekly challenges
- Exemplos: "Convida 3 amigos → 100 KVC", "Desafio da Poupança com amigos"
- Rankings entre amigos (filtro adicional nos rankings existentes)

---

## 3. Ficheiros a Criar/Modificar

| Acção | Ficheiro |
|-------|---------|
| Criar | `supabase/functions/invite-guardian/index.ts` |
| Criar | `supabase/functions/claim-referral/index.ts` |
| Migração | Tabelas `household_guardians`, `referral_codes`, `referral_claims` + coluna `max_guardians` |
| Modificar | `src/pages/parent/ParentChildren.tsx` — secção co-encarregado |
| Modificar | `src/pages/parent/ParentProfile.tsx` — secção referral |
| Modificar | `src/pages/child/ChildProfile.tsx` — secção referral |
| Modificar | `src/pages/teen/TeenProfile.tsx` — secção referral |
| Criar | `src/components/ReferralWidget.tsx` — componente reutilizável |
| Modificar | `src/pages/Login.tsx` — campo "Código de quem te convidou" |
| Modificar | `src/contexts/AuthContext.tsx` — passar referral_code no signup |
| Modificar | `src/i18n/pt.ts` + `src/i18n/en.ts` — traduções |
| Trigger | Auto-gerar referral_code no `handle_new_user` |

---

## Nota sobre o Sistema de Economia

Os itens 1-9 que descreveste (moedas, pontos, níveis, cofres, conquistas, rankings, loja, economia familiar, eventos) **já estão implementados** no sistema actual. A implementação deste plano adiciona a camada viral/social que faltava.

