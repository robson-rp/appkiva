

# Splash Screen — Redesign Premium com Ilustração

## Estado Atual
Splash screen básico: fundo verde sólido (`bg-primary`), logótipo pequeno (h-20), texto "Kivara" e uma barra de progresso simples. Visualmente plano e sem impacto.

## Proposta

Transformar o splash screen num ecrã premium e imersivo:

### Layout
- Fundo com gradiente rico (Kivara-blue para Kivara-green) em vez de cor sólida
- Ilustração decorativa grande (reutilizar `hero-family.png`) posicionada no fundo/centro com opacidade reduzida como elemento visual de ambiente
- Logótipo branco (`logo-kivara-white.svg`) maior (h-28 a h-32) centrado
- Slogan oficial "Pequenos hábitos. Grandes futuros." com gradiente dourado animado
- Subtítulo "Literacia financeira para famílias" mantido
- Barra de progresso mais elegante: mais larga (w-24), com glow effect

### Animações (sequenciais com framer-motion)
1. Ilustração de fundo faz fade-in com ligeiro scale-up (0.3s)
2. Logótipo entra com spring animation (0.5s)
3. Nome "Kivara" desliza de baixo (0.3s, delay 0.3)
4. Slogan gradiente faz fade-in (delay 0.6)
5. Subtítulo faz fade-in (delay 0.9)
6. Barra de progresso com glow (delay 1.0, duração 1.2s)

### Detalhes Visuais
- Partículas/círculos decorativos flutuantes sutis (2-3 bolhas com animate) para dar profundidade
- Backdrop blur na área central do conteúdo
- Sombra suave no logótipo

## Ficheiro
- `src/components/SplashScreen.tsx` — reescrita completa do componente

