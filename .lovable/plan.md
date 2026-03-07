

## Plano: Gestão de Programas de Parceiros ligada aos Planos de Subscrição

### Contexto Actual

Existe um único plano de subscrição para parceiros ("Parceiro", tipo `partner_program`) com limite de 200 crianças. No entanto, actualmente:
- Não há validação de limites ao criar programas
- O parceiro não vê o seu consumo vs. capacidade do plano
- Não existem planos diferenciados para parceiros (e.g. Bronze, Prata, Ouro)

### O que vamos implementar

**1. Planos de subscrição diferenciados para parceiros**

Criar 3 tiers de parceiro na tabela `subscription_tiers` (via insert tool):
- **Parceiro Starter** — gratuito, até 50 crianças, 2 programas
- **Parceiro Pro** — €49.99/mês, até 500 crianças, 10 programas
- **Parceiro Enterprise** — €199.99/mês, crianças ilimitadas, programas ilimitados

Adicionar coluna `max_programs` à tabela `subscription_tiers` (via migration) para limitar o número de programas por plano.

**2. Barra de consumo no topo da página de Programas**

Mostrar ao parceiro:
- Plano actual (nome + badge)
- Programas usados / máximo permitido
- Crianças impactadas / máximo permitido
- Botão de upgrade quando próximo dos limites

**3. Validação na criação de programas**

Antes de criar um novo programa, verificar:
- Se o número de programas activos < `max_programs` do tier
- Se o total de crianças + novas crianças < `max_children` do tier
- Se ultrapassar, mostrar prompt de upgrade em vez de permitir a criação

**4. Página de Subscrição do Parceiro**

Criar `/partner/subscription` (semelhante à `ParentSubscription`) com:
- Plano actual e funcionalidades incluídas
- Comparação entre planos de parceiro
- Botão de upgrade com simulador de pagamento

Adicionar entrada "Subscrição" na sidebar do parceiro.

### Alterações Técnicas

| Ficheiro | Acção |
|----------|-------|
| `subscription_tiers` (migration) | Adicionar coluna `max_programs` (int, default 0) |
| `subscription_tiers` (insert tool) | Inserir tiers Starter/Pro/Enterprise, actualizar o tier "Parceiro" existente |
| `src/hooks/use-partner-limits.ts` | Novo hook que consulta o tier do parceiro e calcula consumo vs. limites |
| `src/pages/partner/PartnerPrograms.tsx` | Adicionar barra de consumo no topo; desactivar botão "Novo Programa" quando no limite |
| `src/components/partner/CreateProgramDialog.tsx` | Validar limites antes de submeter |
| `src/pages/partner/PartnerSubscription.tsx` | Nova página de gestão de plano do parceiro |
| `src/components/layouts/PartnerLayout.tsx` | Adicionar item "Subscrição" na sidebar |
| `src/App.tsx` | Registar rota `/partner/subscription` |

### Fluxo do Utilizador

```text
Parceiro abre "Programas"
  → Vê barra: "3/10 Programas · 120/500 Crianças · Plano Pro"
  → Clica "Novo Programa"
    → Se dentro dos limites → formulário normal
    → Se no limite → mensagem "Limite atingido" + botão "Upgrade"
  → Clica "Subscrição" na sidebar
    → Vê plano actual vs. alternativas
    → Pode fazer upgrade via simulador de pagamento
```

