

# Ajustar Hero — Imagens maiores e títulos proporcionais

## Alterações em `src/pages/LandingPage.tsx`

### 1. Imagens do Hero — aumentar tamanho
- Linha 412: mudar `max-w-sm md:max-w-md` para `max-w-md md:max-w-lg lg:max-w-xl` para que as imagens ocupem mais espaço na coluna direita
- Remover `scale-75` do blur background (linha 408) para acompanhar o novo tamanho

### 2. Títulos — ajustar para máximo 3 linhas
- Linha 378: reduzir ligeiramente os tamanhos de fonte nos breakpoints maiores: `text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem]` (em vez de até 5rem)
- Adicionar `max-w-[600px]` ao h1 para controlar a largura e evitar mais de 3 linhas
- Manter `leading-[1.05]` e `tracking-tight` para boa legibilidade

### 3. Layout do slide
- Linha 371: reduzir padding vertical do slide de `py-12 md:py-20` para `py-8 md:py-16` para dar mais espaço ao conteúdo
- Linha 372: reduzir gap de `gap-8 md:gap-16` para `gap-6 md:gap-10` para aproximar texto e imagem

