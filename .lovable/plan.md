

## Problema: Race condition no login com 2FA

### Diagnóstico

Existe uma condição de corrida (race condition) entre a autenticação e a verificação 2FA:

1. `signInWithPassword` sucede e dispara `onAuthStateChange`
2. `onAuthStateChange` usa `setTimeout(0)` para chamar `fetchKivaraUser` e depois `setUser(kivaraUser)`
3. Enquanto isso, a função `login` faz requests async (verificar roles, trusted device) antes de chamar `setPending2FA(true)`
4. Se `setUser` executa ANTES de `setPending2FA(true)`, o `user` fica exposto momentaneamente
5. O `AppRoutes` vê `user` (parent) e muda para as rotas do parent (redirect para `/parent`)
6. Depois, `setPending2FA(true)` faz `user` voltar a null
7. `AppRoutes` volta para rotas não-autenticadas, que redireccionam para `/` (landing page)
8. O utilizador fica preso em `/` sem ver o ecrã de 2FA

### Correcao

No `AuthContext.tsx`, na funcao `login`, definir `setPending2FA(true)` **imediatamente** apos `signInWithPassword` para roles parent/admin, usando o `user_metadata.role` que ja vem na resposta (sem precisar de request adicional). Isso bloqueia o user antes do `onAuthStateChange` poder expor o user.

```text
Fluxo corrigido:
signInWithPassword OK
  → role metadata = "parent"? → setPending2FA(true) IMEDIATAMENTE
  → depois verifica trusted device
  → se trusted → setPending2FA(false), return requires2FA: false
  → se nao trusted → mantem pending2FA: true, return requires2FA: true
```

### Alteracoes

**`src/contexts/AuthContext.tsx`** - funcao `login`:
- Apos `signInWithPassword` suceder, ler `data.user.user_metadata.role`
- Se role e `parent` ou `admin`, chamar `setPending2FA(true)` imediatamente (antes de qualquer request async)
- Depois verificar roles na BD e trusted device como antes
- Se o dispositivo e trusted ou role nao precisa de 2FA, chamar `setPending2FA(false)`

