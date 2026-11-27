# @block-apps/core

Regras de negócio puras do Block Apps, em TypeScript, sem dependências de execução. É usado pelo backend e por todos os clientes, para que a mesma regra valha nos dois lados.

## O que não faz

- Não acessa rede, disco, AWS nem Cognito (isso é de `packages/api` e `packages/backend`).
- Não tem tela nem código de plataforma (Chrome, Android, iOS).

## Pastas principais (`src/`)

- `rules/`: tipo `BlockRule`, id da regra (`buildRuleId`), mudança pendente e `change/isTighteningChange` (decide se um pedido só aperta o bloqueio).
- `schedule/`: janelas de horário. `evaluation/` diz se uma regra bloqueia agora (`isBlockedNow`); `editing/` valida e edita janelas.
- `cooldown/`: tempo restante e texto das mudanças pendentes.
- `apps/`: catálogo de apps populares do Android e busca de apps (`catalog/`, `search/`).
- `sites/`: normalização do alvo de site para domínio.
- `keywords/`: palavras de busca proibidas (`matching/`) e extração da busca nos buscadores (`search-engines/`).
- `ios/`: normalização dos alvos de seleção e de proteção do iOS.
- `users/`: tipo do usuário usado pelo painel administrativo.

A API pública sai de `src/index.ts`.

## Testes

```powershell
pnpm --filter @block-apps/core test
pnpm --filter @block-apps/core typecheck
```

Os testes ficam em `tests/` ao lado do código de cada pasta.

## Documentação

- [Convenções de código](../../docs/CONVENTIONS.md)
- [Backend](../../docs/BACKEND.md), para ver como as regras são aplicadas no servidor
