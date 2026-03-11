

## Plano: Ajustar tamanho do logótipo na navbar

### Problema
O logótipo (`h-10 md:h-12`) está demasiado grande para a altura da navbar, ficando desproporcional em relação aos links do menu.

### Solução
Reduzir o logótipo para `h-8 md:h-9` na navbar (linha 197), mantendo-o visualmente proporcional à tipografia dos links. O logo do footer permanece inalterado.

### Ficheiro a modificar

| Ficheiro | Linha | Acção |
|---|---|---|
| `src/pages/LandingPage.tsx` | 197 | Alterar `className="h-10 md:h-12"` para `className="h-8 md:h-9"` |

