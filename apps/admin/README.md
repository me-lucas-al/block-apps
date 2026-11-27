# Painel administrativo (`@block-apps/admin`)

Painel web em React e Vite para administradores: convidar, editar, resetar a senha e remover usuários, e cadastrar o próprio TOTP. A entrada é só por e-mail, senha e TOTP, pelo client do painel no Cognito (sem login do Google).

## O que não faz

- Não gerencia regras de bloqueio dos usuários.
- Não decide permissão: as rotas `/admin/*` conferem grupo `admin`, client e MFA no backend; o painel só reage às respostas.

## Pastas principais (`src/`)

- `ports/`: contratos que as telas usam (`AdminUsersGateway`, `ProfileGateway`).
- `adapters/`: implementações HTTP, sessão no navegador (`WebSessionStorage`) e leitura da configuração (`readAdminConfig`).
- `services/`: `createServices.ts`, o ponto de montagem das dependências.
- `hooks/`: estado das telas (usuários, perfil, sessão, TOTP).
- `screens/`: telas de login, senha, TOTP e usuários.
- `components/`: peças de interface (`layout/`, `users/`).
- `users/`: textos de erro e regras do formulário de usuário.

## Configuração

Copie `.env.example` para `.env` e troque pelos outputs do Terraform: `VITE_API_URL`, `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID` (client do painel) e `VITE_COGNITO_HOSTED_DOMAIN`.

## Comandos

```powershell
pnpm --filter @block-apps/admin dev
pnpm --filter @block-apps/admin build
pnpm --filter @block-apps/admin test
pnpm --filter @block-apps/admin typecheck
```

`dev` abre em `http://localhost:5173`. Em produção o site é servido por CloudFront e S3 (`infra/modules/admin_site`); para rodar em container com Nginx há `docker/admin/` e o serviço `admin` do `docker-compose.yml`.

## Documentação

- [Rotas e salvaguardas administrativas](../../docs/BACKEND.md)
- [Desenvolvimento local](../../docs/LOCAL.md)
- [Convenções de código](../../docs/CONVENTIONS.md)
