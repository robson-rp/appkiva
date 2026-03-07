

# Registo e Autenticação -- Plano de Implementação

## Contexto Actual

- O registo usa email+password para todos os perfis, com campo "Nome", "País" e sem distinção de campos por role.
- Crianças e adolescentes podem criar conta livremente (sem vínculo familiar).
- Professores não seleccionam escola; parceiros usam "Nome" genérico.
- Perfil do encarregado não tem campo de género.
- Não existe autenticação OTP por telefone.
- A tabela `profiles` não tem colunas `gender`, `phone`, `school_tenant_id` nem `sector`.

---

## Alterações Necessárias

### 1. Migração da Base de Dados

Adicionar colunas à tabela `profiles`:
- `gender` (text, nullable) -- para encarregados
- `phone` (text, nullable) -- para todos
- `institution_name` (text, nullable) -- para parceiros (substitui display_name no contexto do parceiro)
- `sector` (text, nullable) -- sector de actividade do parceiro
- `school_tenant_id` (uuid, nullable, FK → tenants) -- escola do professor, criança ou adolescente
- `invite_code` (text, nullable) -- código de convite familiar para vincular crianças/teens

Criar tabela `family_invite_codes`:
- `id` uuid PK
- `code` text UNIQUE NOT NULL
- `household_id` uuid FK → households
- `parent_profile_id` uuid FK → profiles
- `created_at`, `expires_at`
- `used_by` uuid nullable FK → profiles
- `used_at` timestamp nullable

RLS: pais podem criar/ver os seus códigos; qualquer autenticado pode ler (para validação no signup).

### 2. Formulário de Registo Condicional (Login.tsx)

Reestruturar o formulário de signup para mostrar campos diferentes consoante o role seleccionado:

- **Encarregado**: Nome, Género (M/F/Outro), País, Email ou Telefone, Palavra-passe
- **Professor**: Nome, País, Escola (select das escolas registadas = tenants com type='school'), Email ou Telefone, Palavra-passe
- **Parceiro**: Nome da Instituição (em vez de "Nome"), Sector de Actividade (select de lista pré-definida), País, Email ou Telefone, Palavra-passe
- **Criança / Adolescente**: Bloqueado -- mostrar mensagem "Pede ao teu encarregado o código de convite familiar" com campo de código. Ao inserir código válido, mostrar campos: Nome, Palavra-passe. O código vincula à household e ao tenant do pai.
- **Admin**: Manter como está (apenas email+password).

### 3. Login por Email ou Telefone

- Adicionar toggle "Email" / "Telefone" no formulário.
- Quando telefone: campo de input com prefixo do país, signup via `supabase.auth.signUp` com `phone` em vez de `email`.
- OTP: Após signup com telefone, mostrar campo OTP para verificação via `supabase.auth.verifyOtp`.
- Requer activar Phone Auth na configuração (via `configure_auth`).

### 4. Lista de Sectores de Actividade

Ficheiro `src/data/partner-sectors.ts` com sectores pré-definidos:
Banca, Seguros, Telecomunicações, Educação, Saúde, Energia, Tecnologia, ONG/Fundação, Governo, Retalho, Outro.

### 5. Género no Perfil do Encarregado

- Adicionar select de género (Masculino, Feminino, Outro) em `ParentProfile.tsx`.
- Persistir na coluna `profiles.gender`.

### 6. Validação de Código Familiar

- Na `AuthContext.signup`, quando role é child/teen, validar o código contra `family_invite_codes`.
- Se válido, associar o novo perfil ao `household_id` e `tenant_id` do pai.
- Marcar o código como usado (`used_by`, `used_at`).

### 7. Geração de Códigos de Convite (ParentChildren.tsx)

- Substituir a geração local de códigos por inserção real na tabela `family_invite_codes`.
- Mostrar códigos activos e expirados.

---

## Ficheiros Afectados

| Ficheiro | Alteração |
|---|---|
| `supabase/migrations/` (nova) | Adicionar colunas profiles + tabela family_invite_codes |
| `src/pages/Login.tsx` | Formulário condicional por role, toggle email/telefone, OTP, código familiar |
| `src/contexts/AuthContext.tsx` | Signup com metadados adicionais (gender, phone, school, sector, invite_code) |
| `src/pages/parent/ParentProfile.tsx` | Campo género |
| `src/pages/parent/ParentChildren.tsx` | Gerar códigos reais na DB |
| `src/data/partner-sectors.ts` (novo) | Lista de sectores |
| `src/components/UpgradePrompt.tsx` | Sem alteração neste bloco |

## Dependência Externa

- Activar Phone Auth via `configure_auth` para suportar OTP por telefone.

