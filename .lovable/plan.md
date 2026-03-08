

# Revisão Responsiva da Landing Page

Após análise detalhada de todas as secções, identifiquei os seguintes problemas responsivos:

## Problemas Encontrados

### 1. Hero — Imagem demasiado pequena em mobile
- Linha 423: `max-w-[200px] sm:max-w-xs` é muito restritivo em mobile. A imagem fica minúscula.
- **Fix**: Aumentar para `max-w-[280px] sm:max-w-sm`

### 2. Hero — Padding vertical insuficiente em mobile
- Linha 381: `py-8 md:py-16` — pouco espaço em mobile para conteúdo tão denso.
- **Fix**: `py-10 md:py-16`

### 3. Universo — Grid 2 colunas em mobile fica apertado
- Linha 641: `grid-cols-2 md:grid-cols-5` — os cards com texto ficam comprimidos em ecrãs <375px.
- **Fix**: `grid-cols-1 xs:grid-cols-2 md:grid-cols-5` — empilhar em ecrãs muito pequenos. Como não há breakpoint `xs`, usar `min-[420px]:grid-cols-2` para ser seguro.

### 4. Trust Section — Grid 2 colunas em mobile pequeno
- Linha 834: `grid-cols-2 gap-3` — os 4 cards de segurança ficam apertados em mobile <375px.
- **Fix**: `grid-cols-1 min-[420px]:grid-cols-2 gap-3`

### 5. Footer — Newsletter input sem min-height
- Linha 1037: O input de email não tem `min-h-[44px]` explícito e o botão "→" é pequeno.
- **Fix**: Garantir touch targets adequados no footer.

### 6. Hero CTAs — Botões empilham mal em mobile estreito
- Linha 396: `flex flex-wrap gap-4` — os dois botões com `px-8` podem não caber lado a lado em <375px.
- **Fix**: `flex flex-col sm:flex-row gap-3` para empilhar verticalmente em mobile.

### 7. Social Proof Stats — Texto muito grande em mobile
- Linha 910: `text-2xl md:text-3xl` para números está bem, mas os cards com `p-5` ocupam muito espaço vertical.
- **Fix**: `p-4 md:p-5` para compactar ligeiramente.

### 8. Navbar altura — `h-18` não é classe Tailwind padrão
- Linha 188: `h-18` não existe no Tailwind por defeito (seria `h-[4.5rem]`). Pode não aplicar.
- **Fix**: Usar `h-[4.5rem] md:h-20`

### 9. Secções de benefícios — Imagens em mobile ocupam espaço excessivo
- `max-w-xl` nas imagens em mobile faz com que ocupem a largura total sem limite visual.
- **Fix**: Adicionar `max-w-sm sm:max-w-md md:max-w-xl` para escalar progressivamente.

### 10. FinalCTA — Botões lado a lado em mobile estreito
- Linha 984: `flex flex-wrap justify-center gap-4` — com `px-8` em cada botão, podem não caber.
- **Fix**: `flex flex-col sm:flex-row justify-center gap-3`

## Resumo das Alterações

Ficheiro: `src/pages/LandingPage.tsx`

| Secção | Linha(s) | Problema | Correção |
|--------|----------|----------|----------|
| Navbar | 188 | `h-18` inválido | `h-[4.5rem] md:h-20` |
| Hero image | 423 | Imagem muito pequena em mobile | `max-w-[280px] sm:max-w-sm md:max-w-lg lg:max-w-xl` |
| Hero CTAs | 396 | Botões overflow em mobile | `flex flex-col sm:flex-row gap-3` |
| Universo grid | 641 | Cards comprimidos <375px | `grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-5` |
| ParentBenefits img | 677 | Imagem sem escala progressiva | `max-w-sm sm:max-w-md md:max-w-xl` |
| SchoolBenefits img | 752 | Idem | `max-w-sm sm:max-w-md md:max-w-xl` |
| Gamification img | 777 | Idem | `max-w-sm sm:max-w-md md:max-w-xl` |
| Trust img | 852 | Idem | `max-w-sm sm:max-w-md md:max-w-xl` |
| Trust grid | 834 | Cards apertados <375px | `grid-cols-1 min-[420px]:grid-cols-2 gap-3` |
| Social stats | 908 | Padding excessivo mobile | `p-4 md:p-5` |
| FinalCTA btns | 984 | Botões overflow | `flex flex-col sm:flex-row justify-center gap-3` |

