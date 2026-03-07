

## Plan: Receita por País/Moeda no AdminFinance + Moedas/Países dinâmicos no AdminTenants

### Problemas identificados

1. **AdminFinance**: Os KPIs de receita total somam valores de moedas diferentes como se fossem a mesma (tudo "AOA"). Não há agrupamento por moeda/país.
2. **AdminTenants**: O selector de moeda ao criar tenant é hardcoded com apenas 4 opções (USD, AOA, NGN, KES), ignorando as 13 moedas/países definidos em `COUNTRY_CURRENCIES`.

### Alterações

#### 1. `AdminFinance.tsx` — Receita agrupada por moeda

- Modificar `useTenantsByTier` para também trazer `currency` de cada tenant.
- Agrupar a receita por moeda (não misturar AOA com USD, EUR, etc.):
  - Nova secção "Receita por Moeda" com cards separados por moeda, cada um mostrando o total mensal/anual nessa moeda.
  - A tabela de detalhe adiciona coluna "Moeda" e agrupa por plano+moeda.
  - Os KPI cards no topo mostram receita separada por moeda (ou a moeda com mais tenants como principal, com as restantes abaixo).
- O gráfico de barras e pie chart agrupam por moeda+plano.
- O total na tabela deixa de somar moedas diferentes — mostra um subtotal por moeda.
- Utilizar `COUNTRY_CURRENCIES` para obter o símbolo correcto de cada moeda.

#### 2. `AdminTenants.tsx` — Selector de país e moeda dinâmico

- Substituir o `<Select>` hardcoded de moeda por um que usa `COUNTRY_CURRENCIES`:
  - Adicionar selector de **País** que auto-preenche a moeda correspondente.
  - Ou listar todas as moedas únicas extraídas de `COUNTRY_CURRENCIES` (com símbolo e nome do país).
- A moeda passa a ser derivada do país seleccionado, mantendo a opção de override manual.

### Ficheiros a modificar

| Ficheiro | Mudança |
|---|---|
| `src/pages/admin/AdminFinance.tsx` | Agrupar receita por moeda, KPIs por moeda, subtotais por moeda na tabela |
| `src/pages/admin/AdminTenants.tsx` | Usar `COUNTRY_CURRENCIES` no formulário de criação de tenant (selector de país → moeda automática) |

### Detalhes técnicos

- Importar `COUNTRY_CURRENCIES` em ambos os ficheiros.
- No Finance, criar um `Map<string, {symbol, monthly, yearly, tenants}>` agrupado por `tenant.currency`.
- Extrair moedas únicas de `COUNTRY_CURRENCIES` para o selector, evitando duplicados (USD aparece 2x).
- Sem alterações de base de dados — tudo frontend.

