

## Problema

O campo de nome na criação de conta de criança usa a chave `t('common.name')` mas essa chave não existe em nenhum ficheiro de tradução (pt.ts, en.ts, fr.ts). Por isso aparece o texto literal `common.name`.

## Correcção

Adicionar a chave `'common.name': 'Nome'` aos três ficheiros de tradução:

| Ficheiro | Chave | Valor |
|---|---|---|
| `src/i18n/pt.ts` | `common.name` | `Nome` |
| `src/i18n/en.ts` | `common.name` | `Name` |
| `src/i18n/fr.ts` | `common.name` | `Nom` |

Alteração mínima — uma linha por ficheiro.

