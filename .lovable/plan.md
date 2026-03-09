

## Diagnóstico e Plano de Correção

### Problemas Identificados

**1. Falta a meta tag `viewport` no `index.html`**
O ficheiro `index.html` não contém `<meta name="viewport" ...>`. Sem esta tag, os browsers móveis renderizam a página como se fosse desktop (largura ~980px) e depois fazem zoom out, quebrando toda a responsividade.

**2. PWA Install Prompt limitado ao Android**
O `beforeinstallprompt` event só é disparado no Chrome/Edge (Android). No iOS Safari este evento nunca acontece, por isso o `InstallPWAPrompt` nunca aparece. É necessário detectar iOS e mostrar instruções manuais ("Partilhar → Adicionar ao ecrã inicial").

**3. Dismiss permanente demasiado agressivo**
O prompt de instalação, uma vez fechado, guarda `pwa-prompt-dismissed=true` no localStorage para sempre. Deveria expirar (ex: 7 dias) para dar nova oportunidade.

### Correções Planeadas

| Ficheiro | Alteração |
|----------|-----------|
| `index.html` | Adicionar `<meta name="viewport" content="width=device-width, initial-scale=1.0">` no `<head>` |
| `src/hooks/use-pwa-install.ts` | Adicionar detecção de iOS/Safari e expor `isIOS` flag |
| `src/components/InstallPWAPrompt.tsx` | Mostrar instruções manuais de instalação no iOS (Share → Add to Home Screen); mudar dismiss para expirar após 7 dias |
| `src/i18n/pt.ts` | Adicionar chaves `pwa.ios_step1`, `pwa.ios_step2`, `pwa.ios_step3` |
| `src/i18n/en.ts` | Adicionar mesmas chaves em inglês |

### Detalhes Técnicos

**Viewport (index.html):**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
```

**Detecção iOS (use-pwa-install.ts):**
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
const isInStandaloneMode = ('standalone' in navigator) && (navigator as any).standalone;
```
Quando `isIOS && !isInStandaloneMode`, o prompt mostra instruções manuais em vez de depender do `beforeinstallprompt`.

**Dismiss com expiração (InstallPWAPrompt.tsx):**
Em vez de guardar `true`, guardar um timestamp. No init, verificar se passaram mais de 7 dias — se sim, mostrar novamente.

