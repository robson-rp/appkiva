

## Plano: Remover saldo KVC do header criança e adolescente

Remover o bloco que mostra "🪙 {balance}" no header dos layouts `ChildLayout.tsx` e `TeenLayout.tsx` para libertar espaço.

### Alterações

1. **`src/components/layouts/ChildLayout.tsx`** — Remover o `div` com classe `bg-accent/15` que contém o ícone 🪙 e o saldo (linhas ~55-58).

2. **`src/components/layouts/TeenLayout.tsx`** — Remover o mesmo bloco equivalente (linhas ~51-54), e remover o import de `mockTeens` que deixa de ser necessário.

