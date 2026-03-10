

## Plano: Corrigir strings hardcoded em ParentMissions e TeenMissions

### Problema

Dois ficheiros contêm dezenas de strings em Portugues hardcoded em vez de usarem o sistema i18n. Se o utilizador mudar para inglês, essas strings ficam em PT.

### Ficheiros afectados

**`src/pages/parent/ParentMissions.tsx`** -- ~30 strings hardcoded:
- Cabeçalho: "Missões", "Cria missões personalizadas..."
- Botão: "Nova Missão"
- Estado vazio: "Sem missões criadas", "Cria a primeira missão..."
- Status badges: "Disponível", "Em Curso", "Concluída"
- Labels de tipo: "Poupança", "Orçamento", "Planeamento", "Personalizada"
- Meta label: "Meta: ..."
- Dialog de eliminar: "Eliminar missão?", "Esta acção não pode ser revertida.", "Cancelar", "Eliminar"
- Dialog criar/editar: "Editar Missão", "Nova Missão", "Título", "Descrição", "Tipo", "Criança", "Escolher", placeholders, "Moedas", "Pontos", "Meta", "Opcional", "Cancelar", "Guardar", "Criar Missão"

**`src/pages/teen/TeenMissions.tsx`** -- ~4 strings hardcoded:
- Estado vazio: "Sem missões", "O teu encarregado ainda não criou missões."
- Botões: "Iniciar", "Concluir"

### Alterações

| Ficheiro | Acção |
|---|---|
| `src/i18n/pt.ts` | Adicionar ~30 chaves `parent.missions.*` e ~4 chaves `teen.missions.*` |
| `src/i18n/en.ts` | Adicionar as mesmas chaves com tradução EN |
| `src/pages/parent/ParentMissions.tsx` | Substituir todas as strings hardcoded por `t('parent.missions.*')` |
| `src/pages/teen/TeenMissions.tsx` | Substituir as 4 strings hardcoded por `t('teen.missions.*')` |

Impacto: zero breaking changes, apenas i18n compliance.

