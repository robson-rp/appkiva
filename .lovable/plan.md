

## Plano: Aumentar espaçamento entre logótipo e menu

### Problema
O logótipo está colado aos links de navegação porque não há margem entre o grupo do logo e o grupo dos links.

### Solução
Adicionar `ml-8` (ou `ml-10`) ao container dos nav links (`div.hidden.md:flex` na linha 200) para criar separação visual entre o logótipo e o primeiro item do menu.

### Ficheiro a modificar

| Ficheiro | Acção |
|---|---|
| `src/pages/LandingPage.tsx` | Linha 200: adicionar `ml-8` ao `div` dos nav links |

