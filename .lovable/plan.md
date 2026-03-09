

# Correcção: Criação de Conta de Criança

## Problema Identificado

A Edge Function `create-child-account` usa `supabase.auth.getClaims()` (linha 27), que **não existe** na API do Supabase JS. Isto faz a função falhar imediatamente com erro 401 ("Unauthorized") antes de sequer processar os dados.

## Solução

Substituir `auth.getClaims()` por `auth.getUser()` no ficheiro `supabase/functions/create-child-account/index.ts`.

### Alteração (linhas 22-31):

**Antes:**
```typescript
const userClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});
const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(authHeader.replace('Bearer ', ''));
if (claimsError || !claimsData?.claims) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
}
const callerUserId = claimsData.claims.sub;
```

**Depois:**
```typescript
const userClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});
const { data: { user: callerUser }, error: userError } = await userClient.auth.getUser();
if (userError || !callerUser) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
}
const callerUserId = callerUser.id;
```

## Ficheiros a modificar

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/create-child-account/index.ts` | Substituir `getClaims` por `getUser` |

Esta é a única alteração necessária. O resto da lógica (validação, criação do utilizador, linking ao household) está correcta.

