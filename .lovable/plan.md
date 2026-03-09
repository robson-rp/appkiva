

# Criar Conta de Criança pelo Encarregado

## Contexto
Atualmente, para adicionar uma criança, o encarregado gera um código de convite e a criança tem de criar conta separadamente (com email + verificação). Isto é uma barreira enorme para crianças pequenas.

## Novo Fluxo
O encarregado cria a conta da criança diretamente no painel de "Filhos", definindo nome, username e PIN. A criança faz login com **username + PIN** (sem email, sem verificação).

## Plano

### 1. Edge Function `create-child-account`
- Recebe: `parent_profile_id`, `display_name`, `username`, `pin`, `avatar`, `date_of_birth`
- Valida que o pai autenticado é dono do `parent_profile_id`
- Verifica limite de crianças (reutiliza lógica do trigger `enforce_max_children`)
- Cria um utilizador no auth com email fictício `{username}@child.kivara.local` e password derivada do PIN
- Define `raw_user_meta_data` com role `child`, display_name, avatar
- O trigger `handle_new_user` já cria o profile e user_role automaticamente
- Atualiza o profile com o `household_id` do pai e o `tenant_id`
- Insere na tabela `children` com `parent_profile_id` e `profile_id`
- Retorna o child_id criado

### 2. Login por Username + PIN (crianças)
- Na página de Login, quando o papel selecionado é **criança**, mostrar campos "Nome de utilizador" + "PIN (4-6 dígitos)" em vez de email + password
- No submit, construir o email fictício `{username}@child.kivara.local` e fazer `signInWithPassword` com o PIN como password
- Sem 2FA, sem verificação de email

### 3. UI no Painel do Encarregado
- Substituir o botão "Adicionar" (que atualmente gera código de convite) por um diálogo de criação direta
- Campos: Nome, Username (único), PIN (4-6 dígitos, com confirmação), Avatar (emoji picker existente), Data de nascimento
- Manter o botão de "Convidar" para adolescentes (que continuam com email)
- Validação: username alfanumérico, PIN numérico 4-6 dígitos, idade mínima 6 anos

### 4. Migração DB
- Adicionar coluna `username` (unique, nullable) à tabela `profiles` para login de crianças
- Índice único em `username` (WHERE username IS NOT NULL)

### Ficheiros a Criar/Modificar
- **Criar**: `supabase/functions/create-child-account/index.ts`
- **Modificar**: `src/pages/Login.tsx` — adicionar modo username+PIN para crianças
- **Modificar**: `src/pages/parent/ParentChildren.tsx` — novo diálogo de criação de criança
- **Modificar**: `src/contexts/AuthContext.tsx` — adicionar método `loginAsChild(username, pin)`
- **Migração**: adicionar coluna `username` a `profiles`

