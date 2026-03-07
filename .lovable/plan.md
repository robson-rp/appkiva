

## Próximos Passos para Lançamento — KIVARA

### Estado Atual: Plataforma ~95% pronta

Todos os problemas críticos (C1–C4) e de alta prioridade (H1–H2) foram resolvidos. Restam itens operacionais antes do go-live.

---

### Checklist Pré-Lançamento

| # | Item | Estado | Ação |
|---|------|--------|------|
| 1 | Desativar auto-confirm de emails | Pendente | Configurar via Auth settings para exigir verificação de email |
| 2 | Ativar proteção contra passwords comprometidas (HIBP) | Pendente | Ativar nas definições de autenticação |
| 3 | Remover credenciais de teste do login | Pendente | Esconder os botões de acesso rápido em produção |
| 4 | Verificar audit triggers ativos | Pendente | Confirmar que os 6 triggers estão a registar mutações |
| 5 | Publicar o projeto | Pendente | Clicar em Publish para deploy do frontend |
| 6 | Conectar domínio personalizado | Opcional | Settings → Domains → kivara.com |

### Recomendações Pós-Lançamento

- **Code splitting** — Adicionar `React.lazy()` nas rotas para reduzir bundle inicial
- **Rate limiting** — Proteger edge functions públicas contra abuso
- **Error tracking** — Integrar serviço de monitorização de erros (Sentry ou similar)
- **Reconciliação automática** — Criar cron job para verificar conservação do money supply periodicamente
- **E2E tests em CI** — Automatizar testes com Playwright para deploy contínuo

### Ação Imediata Recomendada

Desativar auto-confirm de emails e esconder as credenciais de teste do ecrã de login — são os dois itens que impedem um lançamento seguro para utilizadores reais.

