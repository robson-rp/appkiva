

# Landing Page Premium — Plano de Upgrade

## O que mudar

A landing page actual tem boa estrutura mas parece "template". Para nível premium, precisa de: profundidade visual, hierarquia mais forte, microinterações sofisticadas e polish geral.

## Alterações detalhadas

### 1. Hero — Impacto máximo
- Gradient de fundo mais rico com padrão decorativo (dots/grid subtil via CSS)
- Headline com animação de texto por palavra (stagger word-by-word)
- Badge animado com pulse suave
- Botões com gradient e hover glow effect
- Counter animado nos trust badges (números que "contam")
- Glassmorphism card atrás da ilustração

### 2. Navbar — Mais sofisticada
- Efeito de scroll: navbar muda de transparente para blur+sombra ao scroll
- Logo com hover scale suave
- Botão "Criar conta" com gradient-kivara e glow

### 3. Problema — Mais dramático
- Numbered cards com gradient lateral
- Ícones substituídos por Lucide icons estilizados (em vez de emojis)
- Background com gradient radial subtil

### 4. Como Funciona — Linha de conexão visual
- Connector line animado entre os 3 passos (SVG path com draw animation)
- Cards com gradient border ao hover
- Número do passo com gradient background

### 5. Universo — Cards com glassmorphism
- Cards com glassmorphism + gradient borders
- Hover reveal com glow colorido por zona
- Remover imagem do mapa (demasiado genérica), substituir por layout visual com os cards

### 6. Benefícios (Pais + Escolas) — Layout premium
- Cards com left border accent colorida
- Ícones em círculos com gradient backgrounds
- Checkmark animado ao scroll in-view

### 7. Gamificação — Chips interactivos
- Pills/chips com gradient backgrounds em vez de borda simples
- Animação de "pulse" sequencial nos chips

### 8. Confiança — Dark section premium
- Gradient mesh background (múltiplos gradientes radiais)
- Cards com glassmorphism (bg-white/10 backdrop-blur)
- Ícones com ring glow animado

### 9. Prova Social — Contadores animados
- Números com animação de contagem (count-up effect)
- Cards com hover lift e sombra premium
- Gradient accent no valor

### 10. CTA Final — Maximum impact
- Background com animated gradient mesh
- Headline com gradient text
- Botão principal com shimmer/glow animation
- Partículas/sparkles decorativas subtis

### 11. Footer — Premium dark
- Gradient mesh background subtil
- Logo maior com glow
- Social icons com hover effects
- Newsletter input (placeholder visual)

### CSS utilities novas
- `.glass` — glassmorphism utility
- `.gradient-border` — gradient border via pseudo-element
- `.glow-primary` / `.glow-accent` — box-shadow glow effects
- `.shimmer` — shimmer animation para botões CTA

## Ficheiros alterados
- `src/pages/LandingPage.tsx` — Reescrita completa com visual premium
- `src/index.css` — Novas utilities CSS (glass, glow, shimmer)

## Princípios
- Zero dependências novas — apenas Framer Motion + Tailwind + CSS
- Performance: animações com `will-change` e `transform` only
- Mobile-first mantido — glassmorphism degrada gracefully
- Cores existentes do design system — sem cores novas hard-coded

