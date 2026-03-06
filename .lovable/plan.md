

# Remover botao "Rever tutorial" dos layouts

Manter todo o sistema de walkthrough (componente, hook, dados, tabela) intacto. Apenas remover o `RestartOnboardingButton` de todos os 6 layouts.

## Alteracoes

**6 ficheiros de layout** — em cada um:
1. Remover `RestartOnboardingButton` do import (manter `OnboardingWalkthrough`)
2. Remover `<RestartOnboardingButton />` do JSX

Ficheiros afectados:
- `src/components/layouts/ChildLayout.tsx`
- `src/components/layouts/TeenLayout.tsx`
- `src/components/layouts/ParentLayout.tsx`
- `src/components/layouts/TeacherLayout.tsx`
- `src/components/layouts/AdminLayout.tsx`
- `src/components/layouts/PartnerLayout.tsx`

**`src/components/OnboardingWalkthrough.tsx`** — opcionalmente remover a exportacao `RestartOnboardingButton` (codigo morto).

Nenhuma alteracao a base de dados, hook, ou dados de steps.

