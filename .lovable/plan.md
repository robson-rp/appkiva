

## Plano: Adicionar Francês ao selector de idioma da Landing Page

### Problema

A Navbar da Landing Page usa um simples `toggleLocale` que alterna apenas entre `pt` e `en`. Não suporta `fr`.

### Solução

Substituir o botão toggle por um dropdown (DropdownMenu) com 3 opções: 🇵🇹 Português, 🇬🇧 English, 🇫🇷 Français — tanto no desktop (linha 212-219) como no mobile (linha 255-261).

### Alterações

| Ficheiro | Acção |
|---|---|
| `src/pages/LandingPage.tsx` | Remover `toggleLocale`. Substituir os dois botões (desktop e mobile) por um DropdownMenu com 3 opções de idioma. Usar `setLocale` directamente. |

No desktop, o botão mostrará a flag + código do idioma actual e abrirá dropdown com as 3 opções. No mobile, exibir os 3 botões inline ou o mesmo dropdown.

