

## Plano: Revisão e Correcção de Funcionalidades em Falta

Após análise detalhada do código, identifico os seguintes problemas e implementações necessárias, agrupados por área:

---

### 1. TeacherClasses: Migrar de mock data para dados reais (Supabase)

**Problema**: `TeacherClasses.tsx` usa `mockClassrooms` e `mockLeaderboard` (dados estáticos). Não há botões de remover/adicionar alunos visíveis com dados reais.

**Solução**: Reescrever `TeacherClasses.tsx` para usar os hooks já existentes (`useClassrooms`, `useClassroomStudents`, `useCreateClassroom`, `useDeleteClassroom`, `useAddClassroomStudents`, `useRemoveClassroomStudent`, `useSchoolStudents`). As operações CRUD já existem nos hooks — apenas a UI não os utiliza.

- Substituir `useState(() => mockClassrooms...)` por `useClassrooms()`
- Substituir `mockLeaderboard` por `useSchoolStudents(schoolTenantId)` para o picker de alunos
- Usar `useAllClassroomStudents()` para listar alunos por turma
- Adicionar botão de remover aluno em cada card de aluno
- Adicionar dialog de "Adicionar Alunos" com checkbox picker usando dados reais

---

### 2. Perfil da Escola: Permitir edição pelo professor

**Problema**: `TeacherSchoolProfile.tsx` é read-only. Não permite editar dados da escola.

**Solução**: Adicionar formulário de edição básica (nome, settings) para professores verem e potencialmente editarem campos informativos da escola (somente admin edita campos críticos como plano). Manter como visualização detalhada com dados reais.

---

### 3. Registo de Criança/Adolescente: Encarregado define escola

**Problema**: No registo de criança/teen via convite, não há campo para definir a escola. A escola deveria ser herdada do encarregado ou seleccionável.

**Solução**: No fluxo de registo de criança/teen (após código de convite válido), adicionar campo opcional "Escola" pré-preenchido com a escola do encarregado (via `parent_profile_id` do convite → `profiles.school_tenant_id`). Também no `ParentChildren.tsx`, ao gerar convite/adicionar criança, permitir definir a escola.

---

### 4. Upgrade: Crianças/teens apenas solicitam (já implementado — verificar)

**Estado**: Já implementado no `UpgradePrompt.tsx` com detecção de role child/teen e envio de notificação ao encarregado. **Verificar** que o banner aparece no topo e não no centro.

**Correcção**: O `UpgradePrompt` com `variant='banner'` já renderiza no topo. O `FeatureGateWrapper` usa `variant='overlay'` (centro). Para child/teen, forçar `variant='banner'` em vez de `overlay`.

---

### 5. Moeda padrão AOA

**Estado**: Já implementado — `country` default é `'AO'` e `getCurrencyByCountry('AO')` retorna `'AOA'`. Verificado nos profiles e tenants.

---

### 6. Registo de Professor: Escola obrigatória

**Estado**: Já implementado — validação `if (selectedRole === 'teacher' && !schoolTenantId)` existe na linha 126 do Login.tsx.

---

### 7. Registo de Parceiro: Nome da Instituição + Sector

**Estado**: Já implementado — label muda para "Nome da Instituição" quando `selectedRole === 'partner'` e campo Sector aparece com `PARTNER_SECTORS`.

---

### 8. Contacto por telefone/email + OTP

**Estado**: Já implementado — toggle Email/Telefone existe com fluxo OTP via `supabase.auth.signInWithOtp`.

---

### 9. Género no perfil do encarregado

**Estado**: Já implementado — campo género existe tanto no registo como no `ParentProfile.tsx`.

---

### 10. Notificação de upgrade no topo (não centro)

**Problema**: O `FeatureGateWrapper` usa overlay centrado que obriga scroll.

**Solução**: Modificar `FeatureGateWrapper` para usar `variant='banner'` fixo no topo do conteúdo em vez de overlay absoluto centrado. Para children/teens, usar variante com botão "Pedir ao Encarregado".

---

### 11. Admin: Módulo Financeiro

**Problema**: Não existe página `AdminFinance` para receitas de subscrições, simulações e projecções.

**Solução**: Criar `src/pages/admin/AdminFinance.tsx` com:
- Resumo de receita mensal/anual (calculado a partir de `tenants` + `subscription_tiers` prices)
- Gráfico de evolução de receita
- Simulador: "Se X novos tenants no tier Y, receita projectada = Z"
- Tabela de tenants por tier com valores

---

### 12. Admin: Gestão de Utilizadores e Vínculos

**Problema**: Não existe página para ver contas e vínculos familiares/escolares/parceiros.

**Solução**: Criar `src/pages/admin/AdminUsers.tsx` com:
- Lista de todos os profiles com role, tenant, household, school
- Filtros por role, tenant type, escola
- Visualização de vínculos: família (household_id), escola (school_tenant_id), parceiro (tenant com partner type)
- Expandir linha para ver filhos/membros da família

---

### 13. Custo de crianças extras gerido pelo admin

**Problema**: O custo de registo extra de crianças não é configurável no admin.

**Solução**: Adicionar campo `extra_child_price` à tabela `subscription_tiers` (via migration). No `AdminSubscriptions.tsx`, adicionar campo para configurar este preço. No `ParentChildren.tsx`, mostrar o preço do tier actual ao atingir o limite.

---

### Resumo de ficheiros a criar/editar

| Ficheiro | Acção |
|----------|-------|
| `src/pages/teacher/TeacherClasses.tsx` | Reescrever com hooks reais |
| `src/pages/teacher/TeacherSchoolProfile.tsx` | Adicionar edição |
| `src/pages/admin/AdminFinance.tsx` | Criar novo |
| `src/pages/admin/AdminUsers.tsx` | Criar novo |
| `src/components/layouts/AdminLayout.tsx` | Adicionar nav items Finance e Users |
| `src/App.tsx` | Adicionar rotas admin/finance e admin/users |
| `src/components/FeatureGateWrapper.tsx` | Banner no topo em vez de overlay |
| `src/pages/Login.tsx` | Campo escola para child/teen |
| `src/pages/admin/AdminSubscriptions.tsx` | Campo extra_child_price |
| `src/pages/parent/ParentChildren.tsx` | Mostrar preço extra_child |
| Migration SQL | Adicionar `extra_child_price` a `subscription_tiers` |

