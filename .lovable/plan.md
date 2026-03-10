

## Plano: Acelerar o carregamento das páginas

### Problemas identificados

1. **Splash screen de 3.2 segundos** bloqueia toda a app na primeira visita -- mesmo que a sessão e os dados já estejam prontos
2. **QueryClient sem defaults globais** -- cada query sem `staleTime` refaz fetch em cada mount (0ms stale por defeito do React Query)
3. **Layouts carregados eager** mas cada página dentro deles é lazy sem prefetch -- navegação entre páginas do mesmo portal causa spinner
4. **Sem prefetch de rotas adjacentes** -- o dashboard carrega mas não pré-carrega as páginas do menu lateral
5. **Framer Motion importado em quase todas as páginas** -- peso significativo no bundle inicial

### Alterações propostas

**1. Reduzir splash screen para 1.5s**
- `SplashScreen.tsx`: timer de 3200ms → 1500ms
- Experiência continua fluida mas corta ~1.7s do primeiro carregamento

**2. Configurar QueryClient com defaults inteligentes**
- `App.tsx`: adicionar `defaultOptions.queries.staleTime = 60_000` (1 min) e `gcTime = 5 * 60_000`
- Evita re-fetches desnecessários em navegação entre páginas do mesmo portal

**3. Prefetch de rotas adjacentes por portal**
- Criar um hook `usePrefetchRoutes` que, após o dashboard montar, importa dinamicamente as 2-3 páginas mais usadas do menu (ex: wallet, tasks, missions)
- Usa `requestIdleCallback` para não competir com o carregamento principal

**4. Adicionar link prefetch hints para assets críticos**
- `index.html`: adicionar `<link rel="preconnect">` para o domínio do backend
- Reduz latência da primeira query ao backend em ~100-200ms

**5. Otimizar fallback de Suspense**
- Substituir o spinner genérico por um skeleton layout que corresponde à estrutura do portal ativo, eliminando o "flash" visual

### Ficheiros a modificar

| Ficheiro | Alteração |
|---|---|
| `src/components/SplashScreen.tsx` | Timer 3200→1500 |
| `src/App.tsx` | QueryClient defaults + prefetch hook |
| `src/hooks/use-prefetch-routes.ts` | Novo hook de prefetch |
| `index.html` | Preconnect hint |

### Impacto esperado

- **~1.7s** menos no primeiro carregamento (splash)
- **Navegação interna** praticamente instantânea (cache + prefetch)
- Zero breaking changes

