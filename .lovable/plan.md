

## Plano: App Mobile Nativa com Capacitor

A app já tem toda a lógica de roles (parent, child, teen, teacher) implementada — o AuthContext detecta o role e redireciona para o layout adequado. Uma única app nativa com Capacitor reutiliza todo este código existente.

### Abordagem

Usar **Capacitor** para empacotar a app React existente como app nativa iOS e Android. O mesmo código, os mesmos perfis — a app já abre o dashboard correcto conforme o tipo de utilizador.

### Alterações

**1. Instalar dependências Capacitor**
- `@capacitor/core`, `@capacitor/cli` (dev), `@capacitor/ios`, `@capacitor/android`
- Inicializar com `npx cap init` (appId: `app.lovable.18620ef5321f449f8aebb24fba50d28b`, appName: `appkiva`)

**2. Configurar `capacitor.config.ts`**
- Server URL apontando para o sandbox preview com hot-reload durante desenvolvimento
- `cleartext: true` para desenvolvimento local

**3. Ajustes de UI mobile-native**
- Adicionar safe area insets (notch, barra de navegação) via `@capacitor/status-bar` e CSS `env(safe-area-inset-*)`
- Configurar splash screen e ícone da app
- Ajustar a status bar (cor, estilo) por role/tema

**4. Capacidades nativas opcionais (fase seguinte)**
- Push notifications nativas (`@capacitor/push-notifications`) em vez de web push
- Câmara para avatar (`@capacitor/camera`)
- Haptic feedback para interações de gamificação (`@capacitor/haptics`)
- Biometria para login (Face ID / fingerprint)

### Passos do Utilizador (após setup)

1. Exportar projecto para GitHub via "Export to Github"
2. `git pull` + `npm install`
3. `npx cap add ios` e/ou `npx cap add android`
4. `npx cap update ios` / `npx cap update android`
5. `npm run build` + `npx cap sync`
6. `npx cap run ios` (requer Mac + Xcode) ou `npx cap run android` (Android Studio)

### Resultado

Uma única app na App Store e Play Store. O login determina o perfil (Pai, Criança, Adolescente, Professor) e a app abre o dashboard adequado automaticamente — exactamente como funciona hoje na web.

### Secção Técnica

- O routing existente em `App.tsx` já gere os redirects por role
- Os layouts (`ParentLayout`, `ChildLayout`, `TeenLayout`, `TeacherLayout`) já são responsivos
- As melhorias tipográficas e de touch targets (14px floor, 44px buttons) já estão aplicadas
- O Capacitor serve a app React dentro de uma WebView nativa com acesso a APIs do dispositivo

