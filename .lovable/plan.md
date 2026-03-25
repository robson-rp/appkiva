

## Plano: Corrigir Imagens do Carrossel na Página de Login

### Diagnóstico

A base de dados contém 5 banners activos com URLs como `/banners/banner-familia.jpg`, e os ficheiros existem em `public/banners/`. O componente `LoginBannerCarousel` faz a query correctamente, mas **não tem tratamento de erros** — se a query falhar silenciosamente, `banners` fica vazio e mostra apenas o Skeleton infinitamente. Além disso, as imagens não têm fallback `onError`.

### Alterações

**1. Adicionar tratamento de erros na query (`LoginBannerCarousel.tsx`)**
- Logar erros da query Supabase para diagnóstico
- Adicionar estado de erro com fallback visual (em vez de Skeleton eterno)

**2. Adicionar fallback nas imagens**
- Adicionar `onError` handler nas `<img>` tags para tratar imagens que não carregam
- Usar `placeholder.svg` como fallback

**3. Adicionar fallback estático**
- Se a query falhar, mostrar as imagens directamente de `public/banners/` como fallback hardcoded, garantindo que o carrossel nunca fica vazio

### Detalhe Técnico

```
LoginBannerCarousel.tsx:
- useEffect: adicionar .then(({ data, error }) => { if (error) usar fallback estático })
- Fallback estático: array com os 5 banners conhecidos em /banners/
- <img onError>: esconder imagem ou trocar por placeholder
```

Isto garante que o carrossel funciona mesmo que a query à base de dados falhe (ex: problemas de rede, RLS, etc.).

