

## Plan: Progressive Web App (PWA)

### O que será feito

Transformar a Kivara numa PWA completa com instalação, cache offline e push notifications.

### Alterações

| Componente | Descrição |
|---|---|
| `package.json` | Instalar `vite-plugin-pwa` |
| `vite.config.ts` | Configurar `VitePWA` plugin com workbox, manifest e `navigateFallbackDenylist: [/^\/~oauth/]` |
| `index.html` | Adicionar meta tags PWA (`theme-color`, `apple-mobile-web-app-capable`, link para manifest) e título "Kivara" |
| `public/manifest.json` | Criar manifest com nome, cores, ícones e `display: standalone` |
| `public/pwa-192x192.png` e `public/pwa-512x512.png` | Ícones PWA (gerados a partir do favicon/logo existente) |
| `src/components/InstallPWAPrompt.tsx` | Componente que captura o evento `beforeinstallprompt` e mostra um banner/botão "Instalar app" |
| `src/hooks/use-pwa-install.ts` | Hook para gerir o estado de instalação (evento capturado, já instalado, etc.) |
| `src/pages/Install.tsx` | Página `/install` com instruções de instalação e botão de trigger |
| `src/App.tsx` | Adicionar rota `/install` acessível sem autenticação |

### Service Worker e Offline

O `vite-plugin-pwa` gera automaticamente o service worker via Workbox com:
- **Precaching** dos assets estáticos (JS, CSS, HTML, imagens)
- **Runtime caching** com estratégia NetworkFirst para chamadas API ao backend
- **Offline fallback** para a SPA (todas as rotas servem o `index.html` cached)

### Push Notifications

A integração de push notifications será feita em duas camadas:

1. **Frontend**: Hook `use-push-notifications.ts` que solicita permissão, obtém o subscription endpoint via `PushManager.subscribe()` e guarda no backend
2. **Backend**: Tabela `push_subscriptions` para guardar os endpoints; edge function `send-push-notification` para enviar notificações via Web Push API usando VAPID keys
3. **Secrets necessários**: `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` (gerados com `web-push generate-vapid-keys`)

### Detalhes Técnicos

- O `navigateFallbackDenylist` inclui `/~oauth` para não interferir com fluxos de autenticação
- O manifest usa `theme_color: #6366f1` (cor primária do Kivara) e `background_color: #ffffff`
- O prompt de instalação só aparece em dispositivos elegíveis (não mostra em desktop se já instalado)
- Push subscriptions são associadas ao `profile_id` do utilizador autenticado

### Migração de Base de Dados

Nova tabela `push_subscriptions`:
```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(profile_id, endpoint)
);
alter table public.push_subscriptions enable row level security;
```

Com RLS para que cada utilizador só aceda às suas próprias subscriptions.

