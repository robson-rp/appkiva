

## Ajustar Altura do Banner Carousel

O banner atual usa `AspectRatio ratio={3}` (3:1), o que o torna bastante achatado. Vou alterar para `ratio={2.2}` (aproximadamente 2.2:1), o que dará mais altura ao banner mantendo um aspecto panorâmico agradável.

**Alteração**: `src/components/LoginBannerCarousel.tsx` linha 78 — mudar `ratio={3}` para `ratio={2.2}`

