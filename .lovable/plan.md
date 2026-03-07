

## Situação Actual

| Funcionalidade | Página existe? | Funcional? |
|---|---|---|
| Recompensas (`/parent/rewards`) | ✅ Sim | ✅ Sim — CRUD completo com feature gate |
| Suporte Prioritário | ❌ Não | Apenas label nas páginas de subscrição |

## Opções para Suporte Prioritário

O "Suporte Prioritário" é tipicamente um benefício de serviço (tempo de resposta mais rápido, canal dedicado), não uma funcionalidade in-app. Existem duas abordagens possíveis:

### Opção A — Página informativa simples
Criar uma página `/parent/support` (e equivalente para parceiro/professor) que:
- Mostra se o utilizador tem suporte prioritário activo (via feature gate)
- Exibe canais de contacto (email, WhatsApp, etc.)
- Badge "Prioritário" se o plano incluir a feature
- FAQ ou links úteis

### Opção B — Manter como está
O suporte prioritário continua como indicador no plano de subscrição, sem página dedicada. É um benefício operacional gerido externamente.

---

**Recomendação**: Opção A é mais profissional e dá valor visível à feature. Mas depende se querem implementar um canal de suporte in-app ou apenas mostrar informação de contacto.

Qual abordagem prefere?

