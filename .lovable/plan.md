

# Aumentar Tamanho das Imagens nas Secções da Landing Page

As imagens nas secções ParentBenefits, SchoolBenefits, GamificationSection e TrustSection estão limitadas por `max-w-lg` e `max-w-md`. Vamos removê-las ou aumentá-las para que ocupem mais espaço no layout.

## Alterações em `src/pages/LandingPage.tsx`

### ParentBenefits (linha 677)
- `max-w-lg` → `max-w-xl`

### SchoolBenefits (linha 752)
- `max-w-lg` → `max-w-xl`

### GamificationSection (linha 777)
- `max-w-md` → `max-w-xl`

### TrustSection (linha 852)
- `max-w-md` → `max-w-xl`

Todas as imagens passam a usar `max-w-xl`, permitindo que ocupem significativamente mais espaço horizontal dentro da grelha de duas colunas.

