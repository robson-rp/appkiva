

## Suavizar animação hover do StreakWidget

O card usa `whileHover={{ scale: 1.015 }}` e `whileTap={{ scale: 0.985 }}` no wrapper `motion.div` (linha ~48). Além disso, a chama tem uma animação contínua com scale até 1.15 e rotação de -5° a 5°, e há um pulse ring com scale até 1.4.

### Alterações

1. **`src/components/StreakWidget.tsx`**:
   - Reduzir `whileHover` de `scale: 1.015` para `scale: 1.005` e adicionar `transition: { duration: 0.3 }` suave
   - Reduzir `whileTap` de `scale: 0.985` para `scale: 0.995`
   - Suavizar `flameVariants.idle`: reduzir scale de `[1, 1.15, 1]` para `[1, 1.06, 1]`, rotação de `[-5, 5]` para `[-2, 2]`, duração mais longa (2.5s)
   - Suavizar `pulseRing`: reduzir scale máximo de 1.4 para 1.2, duração mais longa (2.2s)

