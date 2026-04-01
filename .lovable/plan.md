

## Relatório de Auditoria de Produção — Kivara v3

### Resumo Executivo

A plataforma está **quase pronta para produção**. A arquitectura é sólida — RLS em 44 tabelas, double-entry ledger sem violações, auth com 2FA e lockout. Existem **6 problemas a corrigir** antes do go-live e **4 melhorias recomendadas**.

---

### Problemas Críticos (Bloqueia Produção)

| # | Problema | Severidade | Detalhe |
|---|---------|-----------|---------|
| 1 | **5 edge functions sem autenticação** | 🔴 Alta | `process-allowances`, `generate-recurring-tasks`, `weekly-summary`, `vault-interest`, `generate-vapid-keys` — qualquer pessoa pode invocar estas funções. Devem validar service-role key ou admin JWT. |
| 2 | **Textos sub-14px em 75 ficheiros** | 🟡 Média | `text-[9px]`, `text-[10px]`, `text-[11px]` encontrados em 1531 ocorrências. Viola o floor tipográfico de 14px definido para acessibilidade mobile. |
| 3 | **Leaked password protection desactivada** | 🟡 Média | O HIBP check não está activo. Utilizadores podem registar-se com passwords comprometidas. |

### Problemas Não-Críticos (Pós-Launch)

| # | Problema | Severidade | Detalhe |
|---|---------|-----------|---------|
| 4 | **Warning React: forwardRef no Kivo** | 🟡 Baixa | `AnimatePresence` tenta passar ref ao componente `Kivo` mas este não usa `forwardRef`. Não quebra funcionalidade mas polui a consola. |
| 5 | **Weekly league reset não implementado** | 🟡 Média | O sistema de ligas tem tiers (Bronze→Diamond) mas falta o cron job de reset semanal. |
| 6 | **VAPID keys não configuradas** | 🟡 Média | Push notifications nativas estão codificadas mas faltam as chaves VAPID como secrets. |

---

### O Que Está Correcto ✅

| Área | Estado |
|------|--------|
| **RLS** | 44/44 tabelas protegidas |
| **Double-entry ledger** | 0 violações, balanço validado universalmente |
| **Auth flow** | Email+password, child PIN, 2FA para parent/admin, lockout progressivo |
| **Edge functions auth** (principais) | 16/21 funções com `getClaims` ou admin guard |
| **CORS** | Todos os edge functions têm headers correctos |
| **XSS** | Nenhum `dangerouslySetInnerHTML` em código de aplicação |
| **Role checks** | Via `has_role()` SQL function, sem localStorage |
| **Idle timeout** | 15min admin, 30min parent |
| **Code splitting** | Todas as páginas com `React.lazy()` |
| **PWA** | Service worker, offline banner, manifest |
| **Tenant isolation** | 0 violações cross-tenant |
| **Audit triggers** | 6 triggers activos em tabelas críticas |
| **Fraud detection** | `check_anomalies()` + `risk_flags` |
| **Capacitor config** | Splash screen, status bar, safe areas |
| **Biometria** | Login + transações + cofre |
| **i18n** | PT/EN/FR com contexto |

---

### Plano de Correcção

**1. Proteger edge functions cron (Crítico)**
- Adicionar verificação de `Authorization: Bearer <service-role-key>` às 5 funções desprotegidas
- Padrão: comparar o header com `SUPABASE_SERVICE_ROLE_KEY` — se não coincidir, retornar 401
- Ficheiros: `process-allowances/index.ts`, `generate-recurring-tasks/index.ts`, `weekly-summary/index.ts`, `vault-interest/index.ts`, `generate-vapid-keys/index.ts`

**2. Corrigir textos sub-14px**
- Substituir `text-[9px]` → `text-xs` (14px)
- Substituir `text-[10px]` → `text-xs` (14px)
- Substituir `text-[11px]` → `text-xs` (14px)
- Afecta ~75 ficheiros mas é uma substituição mecânica

**3. Activar HIBP password check**
- Usar ferramenta de configuração de auth para activar verificação de passwords comprometidas

**4. Corrigir warning Kivo forwardRef**
- Envolver o componente `Kivo` com `React.forwardRef` ou mover a `motion.div` para fora do `AnimatePresence` child directo

**5. Criar cron de league reset (Pós-launch)**
- Edge function que reinicia pontos semanais e recalcula ligas
- Invocar via cron externo ou pg_cron

**6. Configurar VAPID keys (Pós-launch)**
- Gerar par de chaves ECDSA P-256
- Armazenar como secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`)

### Secção Técnica — Detalhe das 5 Funções Desprotegidas

```text
Função                      Risco
─────────────────────────── ──────────────────────────
process-allowances          Qualquer pessoa pode disparar mesadas
generate-recurring-tasks    Pode criar tarefas duplicadas
weekly-summary              Pode enviar resumos a todos os users
vault-interest              Pode calcular juros manualmente
generate-vapid-keys         Gera chaves (menor risco)
```

O fix é simples — 5 linhas por função:
```typescript
const authHeader = req.headers.get("Authorization");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (authHeader !== `Bearer ${serviceKey}`) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
}
```

### Prioridade de Implementação

1. 🔴 Proteger edge functions cron → **imediato**
2. 🟡 Activar HIBP → **imediato** (config change)
3. 🟡 Textos sub-14px → **antes do launch**
4. 🟡 Fix Kivo forwardRef → **antes do launch**
5. 🟢 League reset cron → **sprint seguinte**
6. 🟢 VAPID keys → **sprint seguinte**

