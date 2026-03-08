

# Secção de Preços na Landing Page + Sistema de Idioma/Moeda

## Resumo

Três blocos de trabalho:
1. **Secção de Preços na Landing Page** — tabela de planos com toggle mensal/anual e seletor de moeda (visitante não autenticado)
2. **Sistema de internacionalização (i18n)** — contexto React com dicionários PT/EN, persistido em localStorage
3. **Seletor de idioma e moeda nos perfis** de cada tipo de utilizador

---

## 1. Secção de Preços (Landing Page)

Nova secção `PricingSection` inserida entre `SocialProof` e `FinalCTA`.

### Comportamento
- Carrega os tiers da tabela `subscription_tiers` (query pública — já tem RLS `anyone can view active`)
  - **Problema**: a tabela `subscription_tiers` não tem política SELECT pública. Será necessária uma migração para adicionar `SELECT for anon` com `is_active = true`.
- Toggle **Mensal / Anual** (com badge "Poupa 20%")
- Seletor de moeda no topo (dropdown com as moedas de `COUNTRY_CURRENCIES`)
- Converte preços via `getRegionalPrice` + `useExchangeRates` (mesma lógica de `ParentSubscription`)
- 3-4 cards lado a lado (mobile: carrossel ou stack vertical)
- Card "mais popular" com destaque visual (border accent, badge)
- Cada card: nome do plano, preço, lista de features com checks, CTA "Começar"

### Design
- Fundo alternado (bg-muted/30), consistente com o resto da landing
- Tipografia Space Grotesk, cards com border-radius 2xl, sombras suaves
- Animação fade-up com stagger ao entrar no viewport

### Migração DB necessária
- Adicionar política RLS na `subscription_tiers`: `SELECT for anon WHERE is_active = true`
- Adicionar política RLS na `currency_exchange_rates`: verificar se anon já pode ler (atualmente `anyone can view` mas pode ser restrito a `authenticated`)
- Adicionar política RLS na `tier_regional_prices`: `SELECT for anon` (para preços regionais)

---

## 2. Sistema i18n (Internacionalização)

### Abordagem
- Dicionário simples com dois ficheiros: `src/i18n/pt.ts` e `src/i18n/en.ts`
- `LanguageContext` em `src/contexts/LanguageContext.tsx`:
  - Estado: `locale` ('pt' | 'en')
  - Função `t(key: string): string` para tradução
  - Persistência: `localStorage` para visitantes, campo `language` no perfil para utilizadores autenticados
- Provider envolvendo `App.tsx`
- **Scope inicial**: apenas a landing page e labels dos perfis serão traduzidos nesta fase. O resto da app permanece em PT e poderá ser traduzido incrementalmente.

### Migração DB
- Adicionar coluna `language text DEFAULT 'pt'` à tabela `profiles`

### Dicionários (exemplo parcial)
```typescript
// src/i18n/pt.ts
export default {
  'pricing.title': 'Planos e Preços',
  'pricing.subtitle': 'Escolha o plano ideal para a sua família',
  'pricing.monthly': 'Mensal',
  'pricing.yearly': 'Anual',
  'pricing.save': 'Poupe 20%',
  'pricing.cta': 'Começar',
  'pricing.popular': 'Mais popular',
  'pricing.free': 'Gratuito',
  'profile.language': 'Idioma',
  'profile.currency': 'Moeda',
  // ...
};
```

---

## 3. Seletor de Idioma/Moeda nos Perfis

### Ficheiros a alterar
- `src/pages/parent/ParentProfile.tsx` — já tem seletor de país/moeda; adicionar seletor de idioma
- `src/pages/teen/TeenProfile.tsx` — adicionar secção de idioma e moeda (semelhante ao parent)
- `src/pages/child/ChildProfile.tsx` — adicionar seletor de idioma (moeda herdada do parent)
- `src/pages/partner/PartnerProfile.tsx` — já tem país; adicionar idioma
- **Teacher**: não tem perfil pessoal editável, mas `TeacherSchoolProfile` pode receber o seletor

### UI
- Secção "Preferências" com ícones Globe (idioma) e Coins (moeda)
- Select de idioma: Português / English
- Select de moeda: reutiliza `COUNTRY_CURRENCIES`
- Ao alterar idioma, atualiza `LanguageContext` + persiste no perfil

---

## Ficheiros Novos
| Ficheiro | Descrição |
|----------|-----------|
| `src/i18n/pt.ts` | Dicionário português |
| `src/i18n/en.ts` | Dicionário inglês |
| `src/contexts/LanguageContext.tsx` | Provider + hook `useLanguage` / `useT` |

## Ficheiros Alterados
| Ficheiro | Alteração |
|----------|-----------|
| `src/pages/LandingPage.tsx` | Nova secção `PricingSection` + tradução das strings |
| `src/pages/parent/ParentProfile.tsx` | Seletor de idioma |
| `src/pages/teen/TeenProfile.tsx` | Secção idioma + moeda |
| `src/pages/child/ChildProfile.tsx` | Seletor de idioma |
| `src/pages/partner/PartnerProfile.tsx` | Seletor de idioma |
| `src/App.tsx` | Envolver com `LanguageProvider` |
| `src/main.tsx` ou `src/App.tsx` | Import do provider |

## Migrações DB
1. `ALTER TABLE profiles ADD COLUMN language text DEFAULT 'pt'`
2. RLS: `subscription_tiers` — SELECT para anon onde `is_active = true`
3. RLS: `tier_regional_prices` — SELECT para anon

