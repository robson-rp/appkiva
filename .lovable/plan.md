

## Plan: Add "Outra" option to school selection for parents

### Problem
When a parent registers and their child's school is not yet in the system, they have no way to proceed. They need an "Outra" (Other) option that lets them skip school selection and edit it later in their profile.

### Changes

**1. `src/pages/Login.tsx`** — Update the parent school dropdown (lines 498-518):
- Add a special "Outra" option with value `"other"` to the school `<Select>` for parents
- When "Outra" is selected, show an optional text input for the school name (stored in profile metadata or ignored for now)
- Before submitting, if `schoolTenantId === 'other'`, set it to empty/undefined so no invalid UUID is sent to the database
- Also show the dropdown even when `schools.length === 0` (currently shows "Nenhuma escola registada" message instead), since "Outra" should always be available

**2. `src/pages/parent/ParentProfile.tsx`** — Add school editing capability:
- Add a school selector field to the parent profile page so they can update `school_tenant_id` on their profile later when the school becomes available
- Fetch active schools from `tenants` table and allow the parent to select/change

### Implementation Details

In the signup form (parent role), the Select will render:
```
{schools.map(s => <SelectItem .../>)}
<SelectItem value="other">Outra (editar depois)</SelectItem>
```

On submit, intercept `schoolTenantId === 'other'` and pass `undefined` for `school_tenant_id`.

In `ParentProfile.tsx`, add a section "Escola dos filhos" with a Select populated from the tenants table, saving via `supabase.from('profiles').update({ school_tenant_id })`.

