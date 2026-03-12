

## Melhorar Transição dos Banners

### Problemas actuais
1. **Auto-play de 4s** — demasiado lento para banners promocionais
2. **Transição slide (Embla default)** — deslizar horizontal simples, pouco elegante
3. **Barra de progresso** fina e pouco visível (1.5px)

### Alterações

**1. Reduzir tempo de auto-play**
- `AUTO_PLAY_MS`: 4000 → **3000ms**

**2. Transição crossfade em vez de slide**
- Substituir o layout flex do Embla por um **stack de slides com opacity/scale via CSS transitions**
- Cada slide fica posicionado `absolute` e o activo recebe `opacity: 1, scale: 1` enquanto os outros ficam `opacity: 0, scale: 1.02`
- Transição CSS de ~600ms com `ease-out` para um efeito suave de fade+zoom
- Manter o Embla apenas para controlo de índice e loop, ou substituir por state simples (dado que crossfade não precisa de scroll)

**3. Melhorar indicador de progresso**
- Substituir a barra única por **dots segmentados** (um por banner)
- O dot activo tem uma barra de progresso animada que preenche durante os 3s
- Dots clicáveis para navegação manual

**4. Ficheiro alterado**
- `src/components/LoginBannerCarousel.tsx` — reescrever com crossfade + dots

