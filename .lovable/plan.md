

## Carousel de Banners Publicitários na Página de Login

### O que será feito

Adicionar um carousel horizontal de banners (até 5) abaixo do subtítulo "Seleciona o teu perfil para continuar", visível apenas na vista de seleção de perfil (antes do login/signup).

### Implementação

**1. Tabela `login_banners` (migração)**
```sql
CREATE TABLE public.login_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  display_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.login_banners ENABLE ROW LEVEL SECURITY;

-- Leitura pública (visitantes não autenticados precisam ver)
CREATE POLICY "Anyone can view active banners"
  ON public.login_banners FOR SELECT
  USING (is_active = true);

-- Apenas admins podem gerir
CREATE POLICY "Admins manage banners"
  ON public.login_banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

**2. Storage bucket `banners`**
- Criar bucket público para imagens de banners

**3. Componente `LoginBannerCarousel`**
- Usa Embla Carousel (já instalado via `embla-carousel-react`)
- Busca banners activos ordenados por `display_order`
- Auto-play com intervalo de 4s, pausa ao hover
- Indicadores de pontos (dots) abaixo do carousel
- Fallback: não renderiza nada se 0 banners activos
- Aspecto 16:9 ou 3:1, cantos arredondados, clicável se `link_url` existir

**4. Integração no `Login.tsx`**
- Inserir `<LoginBannerCarousel />` entre o subtítulo (linha ~377) e a grelha de roles (linha ~379)

**5. Ficheiros afectados**
- `src/components/LoginBannerCarousel.tsx` — novo componente
- `src/pages/Login.tsx` — importar e posicionar o carousel
- 1 migração SQL — tabela + RLS + storage bucket

