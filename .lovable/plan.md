

## Remover Subscrição de Professor

O professor é gerido pela escola (tenant), logo não precisa de um plano de subscrição próprio. Vamos remover tudo o que foi criado para isso.

### Alterações

**1. Remover ficheiros**
- Apagar `src/pages/teacher/TeacherSubscription.tsx`
- Apagar `src/hooks/use-teacher-limits.ts`

**2. Remover rota em `src/App.tsx`**
- Apagar o import lazy de `TeacherSubscription` (linha 69)
- Apagar a rota `/teacher/subscription` (linha 223)

**3. Remover nav item em `src/components/layouts/TeacherLayout.tsx`**
- Remover entrada `subscription` dos arrays `navItems` e `mobileMoreItems` (linhas 37 e 49)
- Remover import do icon `CreditCard` se não for usado noutro lugar

**4. Remover tiers `teacher` da DB**
- Migração SQL: `DELETE FROM tier_regional_prices WHERE tier_id IN (SELECT id FROM subscription_tiers WHERE tier_type = 'teacher');`
- `DELETE FROM subscription_tiers WHERE tier_type = 'teacher';`

**5. Limpar i18n**
- Remover chaves `teacher.subscription.*` e `nav.teacher.subscription` de `pt.ts`, `en.ts`, `fr.ts`

**6. Limpar `AdminSubscriptions.tsx`**
- Remover `teacher` como opção de `tier_type` no formulário admin

Os tiers `partner_program` permanecem intactos.

