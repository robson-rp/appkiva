

# Refinar Design — Foco África, Animações e Efeitos Premium

## O que muda

### 1. Ilustrações com personagens de raça mista (foco África)
- Usar a AI de geração de imagens (google/gemini-3-pro-image-preview) para criar novas ilustrações:
  - **Hero**: Criança africana/mista a gerir moedas com pai a supervisionar, mascote Kivo presente
  - **Parents benefit**: Família africana/mista a usar tablet juntos
  - **School benefit**: Sala de aula com crianças diversas e professor
  - **Trust/Security**: Criança protegida em ambiente digital seguro
  - **Gamification**: Crianças diversas a celebrar conquistas
- Estilo: flat illustration moderno, cores da paleta KIVARA (azul profundo, verde, dourado), fundo transparente ou liso

### 2. Animações nos ícones
- Adicionar micro-animações aos ícones das secções com `framer-motion`:
  - **Coins**: rotação suave contínua (rotate 360°)
  - **Target**: pulsação de escala (scale 1→1.15→1)
  - **TrendingUp**: bounce vertical suave
  - **Shield**: glow pulse na cor verde
  - **Trophy**: wiggle/tilt rotation
- Ícones nas cards de benefícios: hover trigger com scale + cor transition
- Feature pills no Hero: entrada com spring stagger

### 3. Efeitos de alto padrão
- **Gradient mesh background** subtil no Hero (radial gradients da paleta)
- **Animated gradient border** nas cards de "Como Funciona" (on hover)
- **Number counter** nos stats com efeito mais dramático (spring bounce)
- **Parallax layers**: múltiplas camadas com velocidades diferentes no Hero
- **Scroll-triggered progress line** SVG entre os 3 passos de "Como Funciona"
- **Hover glow** sutil nas cards (box-shadow animado)
- **Section dividers**: ondas SVG subtis entre secções em vez de cortes retos
- **Testimonial cards**: entrada com rotação 3D subtil (rotateY)

### 4. Polish geral
- Botões CTA com hover gradient shift
- Navbar com blur mais pronunciado e sombra no scroll
- Cards com `backdrop-blur` subtil e bordas semi-transparentes
- Footer com gradiente escuro em vez de cor sólida

### Ficheiros a modificar
- `src/pages/LandingPage.tsx` — animações nos ícones, efeitos premium, gradient mesh, scroll line
- Gerar 5 novas ilustrações via AI e guardar em `src/assets/landing/`

