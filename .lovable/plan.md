

## Plan: Splash Screen PWA + Onboarding para todos os utilizadores

### 1. Splash Screen de abertura (app launch)

Criar um componente `SplashScreen` que exibe o logo Kivara com animação durante 2-3 segundos sempre que a app é aberta (PWA ou browser). Controlo via `sessionStorage` para mostrar apenas uma vez por sessão.

**Componente**: `src/components/SplashScreen.tsx`
- Fundo com a cor da marca (`#2f9e7a`)
- Logo Kivara centralizado com animação scale-in + fade
- Texto "Kivara" e tagline
- Auto-dismiss após ~2.5s com fade-out
- Usa `sessionStorage('splash-shown')` para não repetir na mesma sessão

**Integração em `App.tsx`**:
- Envolver `AppRoutes` com estado `showSplash`
- Mostrar `SplashScreen` antes de qualquer rota (antes do auth check)
- Após dismiss, renderizar a app normal

### 2. Onboarding walkthrough para todos os perfis

O onboarding já está implementado e integrado em todos os 6 layouts (Parent, Child, Teen, Teacher, Admin, Partner). Cada perfil tem os seus steps definidos em `onboarding-steps.ts` com ilustrações dedicadas em `SplashIllustration.tsx`.

O que falta verificar/garantir:
- O hook `useOnboarding` depende de `profileId` e da tabela `onboarding_progress`. Se um utilizador novo nunca teve um registo em `onboarding_progress`, o `showOnboarding` será `true` (correto).
- Confirmar que não há nenhum perfil a ser bloqueado — todos os 6 roles já têm entries em `ONBOARDING_STEPS` e `<OnboardingWalkthrough />` nos seus layouts.

**Resultado**: O onboarding já funciona para todos os perfis. Nenhuma alteração necessária nesta parte.

### Ficheiros a criar/editar

| Ficheiro | Ação |
|---|---|
| `src/components/SplashScreen.tsx` | Criar — ecrã animado de boas-vindas |
| `src/App.tsx` | Editar — adicionar splash antes das rotas |

### Fluxo do utilizador

```text
App abre → SplashScreen (2.5s, logo animado)
         → Auth check
         → Se não autenticado: Login
         → Se autenticado + sem onboarding concluído: Walkthrough
         → Dashboard normal
```

