

## Plano: Melhorar Legibilidade do Texto em Mobile (PWA)

### Problema
Na versão PWA no telemóvel, os tamanhos de texto estão demasiado pequenos. A escala tipográfica actual define:
- `text-caption` = 13px (usado em labels de stats, datas)
- `text-small` = 14px (usado em subtítulos, descrições)
- `text-xs` (override) = 13px

Para um ecrã de 390px com uso ao ar livre, estes valores ficam abaixo do limiar de conforto.

### Alterações

**1. Aumentar a escala tipográfica mínima (`tailwind.config.ts`)**
- `caption`: 13px → 14px (0.875rem)
- `small`: 14px → 15px (0.9375rem)
- Manter os tamanhos `body`, `section`, `heading` como estão (já adequados)

**2. Ajustar o override do `.text-xs` (`src/index.css`)**
- De 13px → 14px (0.875rem), alinhando com o novo floor tipográfico

**3. Aumentar contraste do texto secundário (`src/index.css`)**
- Light mode `--muted-foreground`: de `214 25% 40%` → `214 25% 35%` (mais escuro)
- Dark mode `--muted-foreground`: de `214 15% 65%` → `214 15% 70%` (mais claro)
- Isto melhora a legibilidade dos subtítulos e labels que usam `text-muted-foreground`

**4. Aumentar line-height nos tamanhos pequenos**
- `caption` line-height: 1.125rem → 1.375rem
- `small` line-height: 1.25rem → 1.5rem
- Mais espaço entre linhas melhora a leitura em ecrãs pequenos

### Resultado
Todos os textos da app ficam com um mínimo de 14px (em vez de 13px), com melhor contraste e espaçamento. A mudança é global e afecta todas as páginas automaticamente sem alterar componentes individuais.

