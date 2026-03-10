

## Plano: Adicionar Francês + Corrigir visibilidade do Co-Parenting

### Problemas identificados

1. **Francês não existe**: O sistema suporta apenas `pt` e `en`. Falta criar `src/i18n/fr.ts`, actualizar o `LanguageContext` para suportar `'fr'`, e adicionar a opção `🇫🇷 Français` nos 5 selectores de idioma (Parent, Child, Teen, Teacher, Partner profiles).

2. **Co-Guardian não aparece após upgrade**: A condição na linha 387 de `ParentChildren.tsx` é `tierName && tierName !== 'Free'`. O fallback no `useFeatureQuery` devolve `'Free'` quando não há tenant, mas o tier gratuito na BD chama-se `'Gratuito'`. Após upgrade, o `tierName` deve ser `'Família Premium'`, mas se o tenant não estiver associado ao perfil (ou o query ainda estiver em loading), `tierName` é `null` e o bloco fica invisível. A solução correcta é verificar pela **feature** `multi_child` em vez do nome do tier, ou verificar pelo `tier_type !== 'free'`, garantindo consistência.

---

### Solução

#### 1. Criar ficheiro `src/i18n/fr.ts`
Ficheiro com ~2842 chaves traduzidas para Francês, baseado na estrutura de `en.ts`.

#### 2. Actualizar `LanguageContext`
- Adicionar `'fr'` ao tipo `Locale`
- Importar `fr` e adicioná-lo a `dictionaries`
- Actualizar a validação do `localStorage` para aceitar `'fr'`

#### 3. Adicionar opção Francês nos 5 selectores de idioma
Ficheiros: `ParentProfile`, `ChildProfile`, `TeenProfile`, `TeacherProfile`, `PartnerProfile`
- Adicionar `<SelectItem value="fr">🇫🇷 Français</SelectItem>`
- Actualizar o cast do `setLocale` para `'pt' | 'en' | 'fr'`

#### 4. Corrigir visibilidade do Co-Guardian
Em `ParentChildren.tsx` linha 387, substituir:
```
tierName && tierName !== 'Free'
```
por:
```
hasFeature(FEATURES.MULTI_CHILD)
```
Isto usa a feature gate real (que já está implementada e responde em tempo real via Realtime), em vez de depender do nome do tier.

---

### Ficheiros a modificar

| Ficheiro | Acção |
|---|---|
| `src/i18n/fr.ts` | **Novo** — dicionário completo em Francês |
| `src/contexts/LanguageContext.tsx` | Adicionar `'fr'` ao tipo e dicionário |
| `src/pages/parent/ParentProfile.tsx` | Adicionar opção FR no selector |
| `src/pages/child/ChildProfile.tsx` | Adicionar opção FR no selector |
| `src/pages/teen/TeenProfile.tsx` | Adicionar opção FR no selector |
| `src/pages/teacher/TeacherProfile.tsx` | Adicionar opção FR no selector |
| `src/pages/partner/PartnerProfile.tsx` | Adicionar opção FR no selector |
| `src/pages/parent/ParentChildren.tsx` | Corrigir condição do Co-Guardian para usar `hasFeature(FEATURES.MULTI_CHILD)` |

