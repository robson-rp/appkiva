

## Plano: Configurar Ícones e Splash Screen Nativos para iOS e Android

Os assets `app-icon-1024.png` e `splash-screen-2732.png` já existem em `public/`. Agora é preciso configurar o Capacitor para os usar correctamente em cada plataforma.

### Contexto

O Capacitor gera os ícones e splash screens nativos a partir de imagens fonte, usando o pacote `@capacitor/assets`. Este utilitário redimensiona automaticamente para todos os tamanhos necessários (iOS: 20px a 1024px, Android: mdpi a xxxhdpi).

### Alterações

**1. Instalar `@capacitor/assets` (dev dependency)**
- Ferramenta CLI que gera todos os tamanhos de ícones e splash screens para ambas as plataformas.

**2. Criar estrutura de assets fonte**
- Criar directório `resources/` na raiz do projecto.
- Copiar `public/app-icon-1024.png` → `resources/icon.png` (ícone da app).
- Copiar `public/splash-screen-2732.png` → `resources/splash.png` (splash screen).
- Criar `resources/icon-foreground.png` (versão com padding para adaptive icons Android).

**3. Actualizar `capacitor.config.ts`**
- Adicionar configuração do `SplashScreen` com opções de resize e duração:
  - `launchAutoHide: false` (para controlar via código quando esconder)
  - `androidScaleType: 'CENTER_CROP'`
  - `showSpinner: false`
  - `splashFullScreen: true`
  - `splashImmersive: true`

**4. Documentar comandos de geração**
- Adicionar script `generate-assets` ao `package.json`: `npx capacitor-assets generate`
- Este comando gera automaticamente todos os tamanhos para `ios/` e `android/` quando o utilizador correr localmente.

**5. Controlar splash screen programaticamente**
- Importar `SplashScreen` de `@capacitor/splash-screen` no `App.tsx`.
- Chamar `SplashScreen.hide()` após o carregamento inicial (quando o `SplashScreen` React component termina), para transição suave entre splash nativo e app.

### O que o utilizador faz depois

```bash
git pull && npm install
npx cap add ios    # ou android
npx capacitor-assets generate
npm run build && npx cap sync
npx cap run ios    # ou android
```

O comando `capacitor-assets generate` cria automaticamente todos os ícones (29 tamanhos iOS, 9 tamanhos Android) e splash screens a partir das imagens fonte em `resources/`.

