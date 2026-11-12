# Ambiente local com Docker

Sobe o Supabase inteiro (banco, login, Edge Functions, Studio) e o painel de administração em containers, para testar tudo antes de ir para produção.

Requisitos: Docker Desktop aberto, Node 24 e pnpm.

## 1. Subir o Supabase local

```powershell
pnpm install
pnpm dlx supabase@3.1.0 start -x imgproxy,logflare,vector,supavisor,storage-api
pnpm dlx supabase@3.1.0 status -o env
```

A primeira vez baixa as imagens e demora vários minutos. As migrations de `supabase/migrations` são aplicadas automaticamente. Para aplicar migrations novas depois: `pnpm dlx supabase@3.1.0 migration up`. Para recomeçar do zero: `pnpm dlx supabase@3.1.0 db reset`.

Endereços locais: API `http://127.0.0.1:54321`, Studio `http://127.0.0.1:54323`, e-mails de teste (Mailpit) `http://127.0.0.1:54324`.

As chaves que `status -o env` mostra (`ANON_KEY`, `SERVICE_ROLE_KEY`) são as chaves de demonstração do Supabase local. Servem só neste ambiente.

## 2. Criar o administrador

```powershell
$env:SUPABASE_URL = 'http://127.0.0.1:54321'
$env:SUPABASE_SERVICE_ROLE_KEY = '<SERVICE_ROLE_KEY do status>'
pnpm --filter @block-apps/admin-seed create-admin
```

Variáveis opcionais: `ADMIN_EMAIL` (padrão `admin@block-apps.local`), `ADMIN_PASSWORD` (se faltar, é gerada e impressa uma única vez) e `ADMIN_DISPLAY_NAME`.

No primeiro acesso o painel exige trocar a senha. Depois, em **Minha conta**, edite nome, e-mail e senha.

## 3. Painel de administração

Em desenvolvimento (porta 5173):

```powershell
Copy-Item apps/admin/.env.example apps/admin/.env
# coloque a ANON_KEY do status em VITE_SUPABASE_ANON_KEY
pnpm --filter @block-apps/admin dev
```

Em container (porta 8080), como em produção:

```powershell
$env:VITE_SUPABASE_ANON_KEY = '<ANON_KEY do status>'
docker compose up --build admin
```

## 4. Testes ponta a ponta contra a stack local

```powershell
$env:E2E_API_URL = 'http://127.0.0.1:54321'
$env:E2E_ANON_KEY = '<ANON_KEY do status>'
$env:E2E_SERVICE_ROLE_KEY = '<SERVICE_ROLE_KEY do status>'
pnpm --filter @block-apps/e2e-local test
```

Sem essas variáveis os testes são pulados, então `pnpm test` continua passando sem Docker.

## 5. Desligar

```powershell
docker compose down
pnpm dlx supabase@3.1.0 stop
```

## Segurança

- A chave `anon` pode ir para o navegador. A `service_role` **nunca** vai para o painel, para o app ou para o repositório: ela só existe na Edge Function (injetada pelo Supabase) e no comando que cria o administrador.
- O repositório é público. Nunca versione `.env`, senhas ou chaves de produção.
