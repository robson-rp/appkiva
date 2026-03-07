

## Plan: Controlo de Visibilidade por Tempo (Agendamento de Passos)

### Problema
Atualmente, os passos de onboarding só têm um toggle `is_active` manual. Não existe forma de agendar automaticamente quando um passo fica visível ou invisível.

### Solução
Adicionar campos `visible_from` e `visible_until` (ambos nullable) à tabela `onboarding_steps`. Se preenchidos, o passo só aparece dentro desse intervalo de tempo. Se vazios, comporta-se como hoje (controlado apenas por `is_active`).

### Alterações

**1. Migration SQL**
- Adicionar colunas `visible_from timestamptz` e `visible_until timestamptz` (nullable) à tabela `onboarding_steps`.

**2. `src/hooks/use-onboarding.ts`**
- Alterar a query para filtrar também por `visible_from <= now` e `visible_until >= now` (ou null). Como o Supabase JS não suporta `now()` diretamente em filtros, buscar todos os ativos e filtrar no cliente comparando com `new Date()`.

**3. `src/components/admin/OnboardingStepManager.tsx`**
- Adicionar campos de data/hora (`visible_from`, `visible_until`) ao formulário de criar/editar.
- Na lista de passos, mostrar um badge "Agendado" com o período quando definido.
- Mostrar indicador visual de estado: "Ativo agora", "Agendado (futuro)", "Expirado".
- Adicionar `visible_from` e `visible_until` ao `FormData` e às mutations de insert/update.

### Lógica de Visibilidade
```text
is_active = true
  AND (visible_from IS NULL OR visible_from <= agora)
  AND (visible_until IS NULL OR visible_until >= agora)
→ Passo visível
```

Isto é totalmente funcional e automático -- não precisa de cron jobs. A filtragem acontece no momento em que o utilizador carrega o onboarding.

