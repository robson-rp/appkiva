

# Landing Page de Alta Conversão — KIVARA

## Resumo

Criar uma landing page pública em `/` com 11 secções optimizadas para conversão, seguindo a estrutura definida. A página será acessível sem autenticação e terá navegação para `/login`.

## Arquitectura

### Routing
- Adicionar rota `/` no `AppRoutes` (quando `!user`) apontando para `LandingPage`
- Redirecionar `*` para `/` em vez de `/login` para visitantes não autenticados
- Manter `/login` como rota separada para autenticação

### Ficheiros a criar

**`src/pages/LandingPage.tsx`** — Componente principal que compõe todas as secções:

1. **Navbar fixa** — Logo KIVARA + botões "Entrar" e "Criar conta" (links para `/login`)
2. **Hero** — Headline, subheadline, 2 CTAs (Criar conta familiar / Explorar), ilustração com ícones animados (moedas, missões, Kivo)
3. **Problema** — "A maioria das pessoas aprende sobre dinheiro tarde demais" com 3 pontos de dor
4. **Solução** — "Aprender finanças através da experiência" com descrição prática
5. **Como funciona** — 3 passos visuais (Ganhar → Poupar → Evoluir) com ícones e animações scroll-triggered
6. **Universo KIVARA** — 5 zonas ilustradas (Cidade do Dinheiro, Vale da Poupança, etc.) em cards coloridos
7. **Benefícios Pais** — 4 benefícios com ícones em grid
8. **Benefícios Escolas** — 3 benefícios com ícones
9. **Gamificação** — Elementos de jogo (missões, níveis, ligas, medalhas, avatares)
10. **Confiança/Segurança** — 4 pontos de segurança com ícones shield
11. **Prova Social** — Placeholder com contador e espaço para testemunhos futuros
12. **CTA Final** — Headline forte + 2 botões (Criar conta familiar / Levar para escola)
13. **Footer** — Links, copyright, redes sociais

### Design

- Mobile-first com secções curtas que cabem num scroll
- Usar `framer-motion` para animações de entrada (fade-in on scroll via `whileInView`)
- Paleta KIVARA existente: `gradient-kivara`, cores `kivara-blue`, `kivara-green`, `kivara-gold`
- Tipografia: `font-display` para headlines, `font-body` para texto
- Ícones Lucide para ilustrações (Coins, Target, Trophy, Shield, Users, GraduationCap, etc.)
- Cards `rounded-2xl` com `shadow-kivara`
- Botões primário e outline seguindo o design system existente

### Componentes reutilizados
- `Button` existente (variantes default e outline)
- Logo `logo-kivara.svg` (versão escura) e `logo-kivara-white.svg` (hero/footer)
- Mascote `kivo.svg` no hero

### Performance
- Lazy-load da `LandingPage` no router
- Animações com `whileInView` + `once: true` para não re-animar
- Sem dependências externas novas

## Alterações em ficheiros existentes

- **`src/App.tsx`**: Adicionar rota `/` para `LandingPage`, ajustar redirect de `*` para `/` quando não autenticado

