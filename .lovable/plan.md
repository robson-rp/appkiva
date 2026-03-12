

## Sonhos (Dreams) na Conta do Encarregado

### Problema
A funcionalidade "Sonhos" (Dream Vaults) existe apenas no portal da crianca. O encarregado nao tem acesso para ver, comentar ou gerir os sonhos dos filhos. Nao existe pagina, rota nem item de navegacao no portal do encarregado.

### Solucao

Criar uma pagina `ParentDreams` no portal do encarregado que permita:
- Ver todos os sonhos de cada filho (agrupados por crianca)
- Ver o progresso de cada sonho (barra de progresso, montante atual vs. objetivo)
- Deixar comentarios/mensagens de encorajamento nos sonhos
- Depositar moedas nos sonhos dos filhos

### Alteracoes

1. **Nova pagina `src/pages/parent/ParentDreams.tsx`**
   - Lista sonhos de todos os filhos (via `useDreamVaults()` sem filtro de profileId, que ja retorna sonhos do household)
   - Agrupa por crianca usando dados de `useChildren()`
   - Card para cada sonho com icone, titulo, progresso, comentarios
   - Botao para adicionar comentario (usa `useAddDreamComment`)
   - Botao para depositar moedas (usa `useDepositToDream`)

2. **Atualizar `src/App.tsx`**
   - Importar `ParentDreams` (lazy)
   - Adicionar rota `/parent/dreams`

3. **Atualizar `src/components/layouts/ParentLayout.tsx`**
   - Adicionar item "Sonhos" na navegacao (icone `Sparkles`) com `requiredFeature: FEATURES.DREAM_VAULTS`
   - Posicionar apos "Cofres" na lista

4. **Adicionar traducoes em `src/i18n/pt.ts` e `src/i18n/en.ts`**
   - `nav.parent.dreams`: "Sonhos" / "Dreams"
   - Labels para a pagina (titulo, comentar, depositar, etc.)

### Detalhes Tecnicos
- O hook `useDreamVaults()` sem argumento ja carrega todos os sonhos visiveis via RLS (household-based)
- O hook `useAddDreamComment` ja existe e permite pais comentarem
- O hook `useDepositToDream` ja existe para depositos
- RLS das tabelas `dream_vaults` e `dream_vault_comments` ja permite acesso ao household e insercao por pais
- Nao e necessaria migracao de base de dados

