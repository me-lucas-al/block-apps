# block-apps

Regras do projeto (valem para qualquer sessão):

- **A cada feature concluída, acione o agente `code-reviewer`** (diff da branch contra a base) e trate os achados: corrija na própria branch ou justifique na PR.
- Uma branch por assunto, commits pequenos em inglês (Conventional Commits) e uma PR por branch. PRs empilhadas apontam para a branch anterior.
- `pnpm test` e `pnpm typecheck` limpos antes de abrir PR.
- Estrutura de pastas e convenções de TypeScript, Kotlin e Swift: `docs/CONVENTIONS.md`.
- Sem `Co-Authored-By` nos commits e nas PRs.
- Consulte a documentação atual com Context7 antes de escrever código que dependa de biblioteca ou SDK.
