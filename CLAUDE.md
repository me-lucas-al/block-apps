# block-apps

Regras do projeto (valem para qualquer sessão):

- **Todo código passa pela skill `code-quality-engineer`**: sem comentários, arquivos de até 100 linhas, SRP, DIP, early return, pastas pequenas por tópico.
- **Infra AWS só com Terraform**: nada de AWS CLI nem console para criar ou alterar recursos. Código em `infra/` e aplicado por `terraform plan` e `terraform apply`.
- **Nunca `any`, só `unknown`** (nem em `catch`). `pnpm check:no-any` e o CI barram qualquer `any` explícito.
- **Nomes específicos**: função, variável, parâmetro, hook e componente dizem o que fazem. Nada de `handle*`, `process*`, `manage*`, `run`, `execute`, `data`, `result`, `value`, `item`. Exemplos: `submitLoginForm`, `saveEditedUser`, `reloadUsers`, `buildAdminUsersResponse`.
- **Use cases pequenos em vez de services grandes**: um use case por intenção (`CreateUserUseCase`, `DeleteUserUseCase`), um arquivo cada, método com nome específico (`createUser`). Service só quando for realmente necessário.
- **A cada feature concluída, acione o agente `code-reviewer`** (diff da branch contra a base) e trate os achados: corrija na própria branch ou justifique na PR.
- Uma branch por assunto, commits pequenos em inglês (Conventional Commits) e uma PR por branch. PRs empilhadas apontam para a branch anterior.
- `pnpm test` e `pnpm typecheck` limpos antes de abrir PR.
- Estrutura de pastas e convenções de TypeScript, Kotlin e Swift: `docs/CONVENTIONS.md`.
- Sem `Co-Authored-By` nos commits e nas PRs.
- Consulte a documentação atual com Context7 antes de escrever código que dependa de biblioteca ou SDK.
