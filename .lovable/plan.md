

## Plano: Remover link "Teste" do menu e manter apenas "Simulador"

### Contexto
O utilizador quer que o menu de navegação tenha apenas o link "Simulador", que leva à secção onde estão ambos os conteúdos (simulador + quiz). O link "Teste" será removido.

### Alterações

| Ficheiro | Acção |
|---|---|
| `src/pages/LandingPage.tsx` | Linha 182: remover `{ label: t('nav.quiz'), href: "#teste" }` do array `navLinks` |
| `src/components/FinancialHabitsQuiz.tsx` | Remover `id="teste"` da secção (já não é alvo de âncora) |

Duas alterações simples: eliminar a entrada do menu e a âncora orphã.

