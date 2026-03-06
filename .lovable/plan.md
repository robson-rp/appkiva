

## Plano: Adicionar perfil de Parceiro com gestão completa

### Contexto
Atualmente o login tem 5 perfis (parent, child, teen, teacher, admin). Falta o perfil **partner** para Parceiros Institucionais (Bancos, ONGs) que patrocinam programas. O tenant_type `institutional_partner` já existe na base de dados, mas não existe um role `partner` no enum `app_role`.

### Alterações necessárias

#### 1. Migração de base de dados
- Adicionar `'partner'` ao enum `app_role`
- Actualizar a função `handle_new_user()` para aceitar o role `partner`

#### 2. Páginas do Parceiro (novas)
- **`src/pages/partner/PartnerDashboard.tsx`** — Painel com KPIs: famílias/escolas patrocinadas, total de crianças impactadas, investimento total, taxa de engajamento
- **`src/pages/partner/PartnerPrograms.tsx`** — Lista de turmas/famílias associadas ao tenant do parceiro, com filtros e estado do patrocínio
- **`src/pages/partner/PartnerReports.tsx`** — Relatórios de impacto: evolução mensal, métricas de literacia financeira, desafios patrocinados completados
- **`src/pages/partner/PartnerChallenges.tsx`** — Criar e gerir desafios patrocinados (branded challenges) para as escolas/famílias associadas

#### 3. Layout do Parceiro (novo)
- **`src/components/layouts/PartnerLayout.tsx`** — Sidebar com navegação: Dashboard, Programas, Desafios, Relatórios. Estilo consistente com os outros layouts (AdminLayout pattern)

#### 4. Login e Routing
- **`src/pages/Login.tsx`** — Adicionar `partner` ao `ROLE_CONFIG` e `ROLE_ORDER` com ícone `Building2`, label "Parceiro", descrição "Gestão do programa de parceria institucional"
- **`src/contexts/AuthContext.tsx`** — Adicionar `'partner'` ao tipo `UserRole`
- **`src/App.tsx`** — Adicionar bloco de rotas para `user.role === 'partner'` com as 4 páginas acima
- **`src/types/kivara.ts`** — Adicionar `'partner'` ao tipo `UserRole`

#### 5. Seed de teste
- Actualizar `seed-test-accounts` para criar conta de teste `parceiro@kivara.com` com role `partner`

### Notas técnicas
- Os dashboards usarão inicialmente dados mock/placeholder enquanto não existem tabelas específicas de programas de parceria
- As RLS policies existentes nos tenants já permitem que utilizadores vejam o seu próprio tenant, o que é suficiente para o parceiro ver os dados do seu `institutional_partner` tenant
- O parceiro partilha o padrão de feature gate existente via `subscription_tiers` com `tier_type = 'partner_program'`

