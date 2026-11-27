# @block-apps/api

Camada de acesso a dados e de autenticação compartilhada pelos três clientes (extensão, painel e app). Fala com o backend por HTTP e com o Cognito.

## O que não faz

- Não tem tela.
- Não guarda sessão por conta própria: `SessionStorage` é um contrato. Cada cliente entrega o seu (`SecureSessionStorage` no mobile, `WebSessionStorage` no painel, `ChromeSessionStorage` na extensão); aqui só existe `MemorySessionStorage`.
- Não decide regra de bloqueio (isso é de `packages/core`).

## Pastas principais (`src/`)

- `auth/cognito/`: login por senha com SRP, desafios (nova senha, TOTP), fluxo OAuth do Google, renovação e revogação de tokens.
- `auth/contracts/`: contratos de autenticação, sessão e armazenamento.
- `auth/google/` e `auth/pkce/`: passos compartilhados do login com Google e o PKCE.
- `auth/session/`: `LocalUserSession`, a sessão do usuário atual.
- `http/client/`: `HttpApiClient` (renova o token em 401) e `ApiError`.
- `repositories/contracts/`: o que os clientes pedem ao servidor (regras, mudanças pendentes, dispositivos, usuários do painel).
- `repositories/http/`: implementações dos contratos sobre `HttpApiClient`.
- `polling/`: `RulePoller`, que relê as regras de tempos em tempos.
- `config/` e `subscription/`: leitura obrigatória de configuração e o tipo de cancelamento de assinatura.

A API pública sai de `src/index.ts`.

## Testes

```powershell
pnpm --filter @block-apps/api test
pnpm --filter @block-apps/api typecheck
```

Os testes ficam em `tests/`, na raiz do pacote. `tests/integration/` liga os repositórios ao app do backend em memória (por isso o `package.json` tem `@block-apps/backend` como dependência de desenvolvimento).

## Documentação

- [Convenções de código](../../docs/CONVENTIONS.md)
- [Rotas que os repositórios chamam](../../docs/BACKEND.md)
