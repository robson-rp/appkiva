

# Hero Carousel + Preenchimento da Landing Page

## 1. Hero — Carrossel de 6 slides

Substituir a imagem estática do Hero por um carrossel automático com 6 slides, cada um destacando um aspecto diferente da plataforma:

| Slide | Tema | Headline | Imagem |
|-------|------|----------|--------|
| 1 | Visão geral | "Pequenos hábitos. Grandes futuros." | Criança + pai + moedas |
| 2 | Missões | "Aprende através de missões" | Criança a completar tarefas |
| 3 | Poupança | "Poupa para os teus sonhos" | Cofre com progresso visual |
| 4 | Famílias | "Toda a família aprende junta" | Família a usar tablet |
| 5 | Escolas | "Leva KIVARA para a escola" | Sala de aula com crianças |
| 6 | Segurança | "Seguro e supervisionado" | Shield/proteção visual |

Implementação:
- Usar `embla-carousel-react` (já instalado) com autoplay (5s), loop, e indicadores de slide
- Cada slide ocupa o **full-width** do Hero com layout 2 colunas (texto + imagem)
- Transição suave com fade + slide
- Indicadores estilo dots com progresso animado (como o `LoginBannerCarousel`)
- Gerar 5 novas imagens via AI (slide 1 reutiliza hero-illustration existente)

## 2. Preenchimento geral — menos espaço em branco

- **Reduzir padding vertical** das secções: `py-24 md:py-36` → `py-16 md:py-24`
- **Cards mais compactos**: reduzir `p-8` → `p-6` nos cards de Problem, How It Works, Universe
- **Solução**: adicionar ícones visuais inline aos 4 checks para dar mais corpo
- **Universe**: mudar de grid 2x3 para layout com imagem de fundo ou ilustração central rodeada pelos 5 itens
- **Gamificação**: adicionar screenshot/mockup da plataforma ao lado dos chips
- **Social Proof**: compactar stats + testimonials, menos margin entre eles
- **Trust Section**: preencher com um badge/selo visual grande ao lado dos 4 pontos
- **Footer**: ligeiramente mais compacto

## 3. Imagens a gerar (6 total)

Usar `google/gemini-3-pro-image-preview` para criar ilustrações consistentes com o estilo africano/misto:
1. Hero slide 2 — criança mista a completar missão digital
2. Hero slide 3 — cofre animado com moedas e barra de progresso
3. Hero slide 4 — família africana/mista unida com tablet
4. Hero slide 5 — sala de aula africana com professor
5. Hero slide 6 — escudo/proteção digital com criança
6. Gamificação — mockup/screenshot estilizado da plataforma

## Ficheiros a modificar
- `src/pages/LandingPage.tsx` — Hero carousel, padding reduction, layout density
- `src/assets/landing/` — 6 novas imagens geradas

