

# Auditoria: Botoes, Links e Funcionalidades Sem Accao

## Problemas Encontrados

### 1. Botao "Apagar Crianca" (Trash) - ParentChildren.tsx (linha 312)
O botao de lixeira para apagar uma crianca nao tem `onClick` handler. E puramente visual.

**Correcao:** Adicionar dialogo de confirmacao e logica de eliminacao (crianca + perfil associado) via RPC segura.

### 2. Rota `/join/:code` nao existe no router
O `ParentChildren.tsx` gera links de convite com `${origin}/join/${inviteCode}` (linha 94), mas o `App.tsx` nao define nenhuma rota `/join/:code`. Qualquer pessoa que clique no link de convite vai para uma pagina 404 ou e redirecionada.

**Correcao:** Adicionar rota `/join/:code` no App.tsx que redireciona para o fluxo de registo/associacao de crianca.

### 3. Botao "Poupar" nos Sonhos (ChildDreams.tsx, linha 162)
O botao "Poupar" dentro de cada sonho (dream vault) nao tem `onClick` handler. E um botao morto.

**Correcao:** Adicionar logica de deposito no dream vault, semelhante ao deposito nos savings vaults.

### 4. Missoes usam dados mock e nao sao interactivas (ChildMissions.tsx)
O separador "Missoes" usa `mockMissions` e o componente `DailyMissionCard` nao tem nenhum botao de accao (iniciar, completar). As missoes sao puramente visuais/informativas.

**Correcao:** A medio prazo, criar tabela de missoes no backend. A curto prazo, adicionar botoes "Iniciar" e "Completar" com logica mock ou toast informativo.

### 5. Diario Financeiro usa apenas dados mock (ChildDiary.tsx)
O diario guarda entradas apenas em estado local (`useState`). Ao recarregar a pagina, tudo se perde.

**Correcao:** Criar tabela `diary_entries` no backend e persistir as entradas.

### 6. Relatorios do Pai usam dados mock (ParentReports.tsx)
A pagina de relatorios usa `mockChildren`, `mockTasks`, `mockTransactions`, `mockInsights` e `mockVaults` em vez de dados reais do backend.

**Correcao:** Substituir dados mock por queries reais ao backend.

### 7. Codigo de convite nao e persistido no backend
O `ParentChildren.tsx` gera codigos de convite aleatoriamente no frontend (`generateCode()`), mas nunca os guarda na base de dados. Existe uma tabela `family_invite_codes` e funcoes `validate_invite_code`/`claim_invite_code`, mas nao sao utilizadas.

**Correcao:** Ao gerar codigo, inseri-lo na tabela `family_invite_codes`. Ao abrir rota `/join/:code`, validar e consumir o codigo.

### 8. Dashboard da Crianca usa mock data parcialmente
`ChildDashboard.tsx` usa `mockChildren[0]` para nome, nivel, pontos e outros dados estaticos em vez do perfil real autenticado. Tarefas pendentes e missoes vem de mock data.

**Correcao:** Substituir `mockChildren[0]` pelo perfil real do utilizador autenticado.

---

## Plano de Implementacao (por prioridade)

### Prioridade Alta (funcionalidade quebrada para o utilizador)

1. **Adicionar rota `/join/:code`** no App.tsx para todos os roles que a necessitam, mapeando para uma pagina de registo/associacao de crianca.

2. **Persistir codigos de convite** - Ao clicar "Convidar"/"Adicionar" em ParentChildren, inserir o codigo na tabela `family_invite_codes` via Supabase.

3. **Botao "Apagar Crianca"** - Adicionar `onClick` com dialogo AlertDialog de confirmacao e chamada de eliminacao.

4. **Botao "Poupar" nos Sonhos** - Adicionar dialogo de deposito semelhante ao dos cofres normais.

### Prioridade Media (dados mock em vez de reais)

5. **Migrar ChildDashboard** de mock data para dados reais do utilizador autenticado.

6. **Migrar ParentReports** para usar dados reais de transaccoes e tarefas.

7. **Persistir Diario Financeiro** criando tabela `diary_entries` e migrando do estado local.

### Prioridade Baixa (funcionalidade futura)

8. **Sistema de Missoes** - Criar backend para missoes diarias/semanais em vez de mock data.

---

## Detalhes Tecnicos

- **Rota `/join/:code`:** Ja existe `validate_invite_code` e `claim_invite_code` como funcoes RPC. Basta criar a rota e a pagina.
- **Apagar crianca:** Necessita funcao RPC `SECURITY DEFINER` que verifique propriedade do pai antes de eliminar o registo `children` (cascata para perfil e wallets).
- **Dream vault deposit:** Reutilizar a edge function `vault-deposit` existente, adaptando para dream vaults.
- **Persistencia do diario:** Criar migration com tabela `diary_entries(id, profile_id, text, mood, tags, created_at)` com RLS.

