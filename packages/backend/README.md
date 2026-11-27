# @block-apps/backend

API do Block Apps: Hono rodando em Lambda, use cases pequenos e adaptadores DynamoDB e Cognito. Cinco funções saem do mesmo pacote (`apiHandler`, `adminHandler`, `dnsHandler`, `preSignUpHandler`, `schedulerHandler`), exportadas em `src/index.ts`.

## O que não faz

- Não cria infraestrutura: o Terraform em `infra/` publica o `lambda.zip` que este pacote gera.
- Não tem tela nem cliente. Os clientes falam com ele pelo `packages/api`.
- O `userId` nunca vem do corpo da requisição, só do token validado.

## Pastas principais (`src/`)

- `domain/`: erros, normalização e validação de regras, relógio.
- `rules/`, `cooldown/`, `devices/`, `users/`, `auth/`: um use case por intenção, com os contratos que cada um precisa.
- `dns/`: token, fuso e perfil de DNS, e o resolvedor DoH (`resolver/`, `upstream/`).
- `storage/`: implementações em DynamoDB (`dynamodb/`) e Cognito (`cognito/`).
- `http/`: apps Hono (`app/`), autenticação pelos claims do JWT (`auth/`), rotas, parsing de corpo e erros.
- `composition/`: liga stores e use cases; é o único lugar que conhece as implementações.
- `lambda/`: uma entrada por função.
- `local/`: servidor local e Cognito falso. Nunca entra no zip da Lambda (um teste confere).

`scripts/` empacota a Lambda (`packageLambda.mjs`), gera o servidor local (`buildLocal.mjs`) e tem um teste de fumaça contra uma API publicada (`smokeTest.mjs`, com `API_URL` e, opcionalmente, `AUTH_TOKEN`).

## Comandos

```powershell
pnpm --filter @block-apps/backend test
pnpm --filter @block-apps/backend typecheck
pnpm --filter @block-apps/backend package
pnpm --filter @block-apps/backend local
```

Os testes rodam contra um banco em memória; com `DYNAMODB_ENDPOINT` apontando para o DynamoDB local (`docker compose -f docker-compose.backend.yml up -d`) rodam também contra ele. `package` gera `dist/lambda.zip`; `local` sobe a API em `http://127.0.0.1:3000`. Os testes ficam em `tests/`, na raiz do pacote.

## Documentação

- [Backend: modelo de dados, rotas, DNS e limites](../../docs/BACKEND.md)
- [Desenvolvimento local](../../docs/LOCAL.md)
- [Infraestrutura](../../docs/INFRA.md)
