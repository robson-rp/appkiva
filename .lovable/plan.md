

## Diagnóstico

A tabela `login_banners` existe mas está vazia — o remix criou uma base de dados nova sem os dados do projecto original. Os banners precisam de ser re-inseridos.

## Plano: Seed dos banners de login

Criar uma migração SQL que insere os banners usando as imagens já existentes no projecto (`src/assets/banners/`). Como os assets locais não funcionam como URLs na base de dados, há duas opções:

### Opção recomendada

Inserir registos na tabela `login_banners` com `image_url` apontando para as imagens dos banners. As imagens em `src/assets/banners/` são ficheiros locais que são compilados pelo Vite com hashes — não servem como URLs estáticas para a BD.

**Solução**: Mover as 5 imagens de banner para `public/banners/` (ficam acessíveis como URLs estáticas) e inserir os registos via migração SQL.

### Ficheiros a alterar

| Ficheiro | Alteração |
|---|---|
| `public/banners/` | Copiar as 5 imagens de `src/assets/banners/` para cá |
| Migração SQL | Inserir 5 registos em `login_banners` com URLs relativas (`/banners/banner-familia.jpg`, etc.) |

### SQL da migração

```sql
INSERT INTO public.login_banners (title, image_url, display_order, is_active) VALUES
  ('Família', '/banners/banner-familia.jpg', 1, true),
  ('Missões', '/banners/banner-missoes.jpg', 2, true),
  ('Poupar', '/banners/banner-poupar.jpg', 3, true),
  ('Recompensas', '/banners/banner-recompensas.jpg', 4, true),
  ('Sonhos', '/banners/banner-sonhos.jpg', 5, true);
```

### Impacto
Os 5 banners voltam a aparecer no carrossel da página de login imediatamente após a migração.

