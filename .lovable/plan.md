## Ajustar Banner Carousel

Duas alterações em `src/components/LoginBannerCarousel.tsx`:

1. **Aumentar altura do banner**: Mudar `ratio={2.2}` para `ratio={1.8}` (linha 78) — banner mais alto
2. **Reduzir e melhorar o design dos dots de navegação**: Diminuir os indicadores (linha 99-103):
  - Dot ativo: `h-1.5 w-6` → `h-1 w-4`
  - Dot inativo: `h-1.5 w-1.5` → `h-1 w-1`
  - Gap: `gap-1.5` → `gap-1`
  - Margem: `mt-3` → `mt-2`