

## Plan: Corrigir flash da página de login após autenticação

### Problema

Quando o utilizador faz login, há uma condição de corrida no `AuthContext`:

1. `onAuthStateChange` dispara com a nova sessão
2. `setSession(newSession)` executa imediatamente
3. `setTimeout` é usado para buscar o perfil do utilizador (para evitar deadlocks)
4. Durante esse gap, `loading` já é `false` (definido pelo `getSession` inicial) e `user` ainda é `null`
5. `AppRoutes` vê `!user` com `loading === false` → mostra a página de Login brevemente antes do perfil ser carregado

### Solução

No `AuthContext.tsx`, definir `setLoading(true)` no início do callback `onAuthStateChange` quando há um utilizador na sessão. Isto garante que o spinner de loading é mostrado enquanto o perfil é buscado, evitando o flash.

### Ficheiro a modificar

| Ficheiro | Mudança |
|---|---|
| `src/contexts/AuthContext.tsx` | Adicionar `setLoading(true)` antes do `setTimeout` no `onAuthStateChange` quando `newSession?.user` existe |

### Alteração concreta

```typescript
// onAuthStateChange callback
if (newSession?.user) {
  setLoading(true);  // ← ADICIONAR ESTA LINHA
  setTimeout(async () => {
    const kivaraUser = await fetchKivaraUser(newSession.user);
    setUser(kivaraUser);
    setLoading(false);
  }, 0);
}
```

Sem alterações de base de dados. Uma linha adicionada.

