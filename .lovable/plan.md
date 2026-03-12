

## Diagnóstico

O problema está no facto de existirem **dois fluxos independentes e incompatíveis** para adicionar crianças:

1. **Criação directa** (botão "Adicionar Criança") — cria a conta da criança imediatamente via edge function, atribui à família, e a criança entra com username+PIN.
2. **Código de convite** (botão "Convidar") — gera um código para a criança se auto-registar na página de login com email+password.

Quando o encarregado cria a criança pelo diálogo e depois tenta usar o código de convite na conta da criança, o código não funciona porque:
- A criança já tem conta e já está na família
- O código de convite serve para criar uma conta NOVA, não para ligar uma existente
- A criança criada pelo diálogo usa login com username+PIN, não email+password

## Plano de Correcção

### 1. Após criar criança, mostrar credenciais de login (não código de convite)
No diálogo de sucesso da criação, mostrar claramente:
- Username da criança
- PIN de acesso
- Botão para copiar credenciais
- Instrução: "A criança já pode entrar com estes dados"

### 2. Separar os dois fluxos no UI
No ecrã `ParentChildren.tsx`:
- Manter o botão "Adicionar Criança" (criação directa — fluxo principal)
- Renomear "Convidar" para algo como "Enviar convite de registo" com descrição: "Para crianças/adolescentes que criarão a sua própria conta com email"
- Adicionar nota explicativa no diálogo de convite: "Este código é para crianças que vão criar a sua própria conta. Se já criaste a criança pelo botão 'Adicionar', não precisas deste código."

### 3. Mostrar credenciais na lista de crianças
Adicionar opção para o encarregado ver o username e redefinir o PIN de cada criança já criada.

### Ficheiros a modificar
- `src/pages/parent/ParentChildren.tsx` — diálogo de sucesso pós-criação + UX do convite

