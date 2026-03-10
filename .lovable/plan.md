

## Plano: Barra de progresso real nas missões com Meta

### Problema actual
Na linha 384, o progresso é calculado com `Math.random()` — é falso. Missões com `target_amount` definido mostram uma percentagem aleatória que muda a cada render. Missões disponíveis mostram a meta mas sem barra de progresso.

### Solução

Calcular o progresso real com base no saldo da wallet da criança em relação ao `target_amount` da missão. Para missões sem `target_amount`, não mostrar barra de progresso.

### Alterações

| Ficheiro | Acção |
|---|---|
| `src/pages/child/ChildMissions.tsx` | Importar `useWallet`, calcular `progress = (balance / target_amount) * 100` para missões com meta. Mostrar barra de progresso nos 3 estados (available, in_progress, completed) quando `target_amount` existe. |

### Detalhes técnicos

1. **In Progress** (linhas 382-418): Substituir `Math.random()` por cálculo real usando saldo da wallet. Mostrar `{balance}/{target_amount} 🪙` junto à percentagem.

2. **Available** (linhas 430-465): Adicionar barra de progresso abaixo da meta existente (que já mostra o target_amount), para a criança ver quanto já tem antes de iniciar.

3. **Completed** (linhas 478-499): Mostrar barra a 100% para missões concluídas com meta, como confirmação visual.

4. Usar o hook `useWallet` já existente para obter o saldo actual da criança.

