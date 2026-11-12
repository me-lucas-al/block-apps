# Desenvolvimento Local

Instruções para executar o ambiente localmente sem dependência direta da nuvem AWS.

## Pré-requisitos

- Node.js 24+
- pnpm 12+
- Docker e Docker Compose (para DynamoDB local)

## 1. Banco de Dados Local (DynamoDB Local)

Para rodar os testes de integração do backend contra o DynamoDB local:

```powershell
docker compose -f docker-compose.backend.yml up -d
$env:DYNAMODB_ENDPOINT = "http://127.0.0.1:8000"
pnpm test
```

### Visualizar os dados (equivalente ao pgAdmin)

Os dois arquivos de compose sobem o `dynamodb-admin`, uma interface web para ver e editar tabelas e itens do DynamoDB local. Abra `http://127.0.0.1:8001`.

Em produção não há painel hospedado. Use o Console AWS (DynamoDB → Explore items) ou o NoSQL Workbench com suas credenciais.

## 2. Servidor de API Local

Para servir a API Hono localmente sem deploy na AWS:

```powershell
docker compose -f docker-compose.local.yml up -d --build
```

O servidor sobe em `http://127.0.0.1:3000`.

### Autenticação em Desenvolvimento

O servidor local aceita tokens no formato `Authorization: Bearer dev:<userId>:<grupos>`:
- Administrador: `Bearer dev:00000000-0000-4000-8000-0000000000a1:admin`
- Usuário comum: `Bearer dev:00000000-0000-4000-8000-0000000000b1:user`

## 3. Painel Administrativo (`apps/admin`)

```powershell
pnpm --filter @block-apps/admin dev
```

Abre em `http://localhost:5173`. As variáveis de conexão ficam em `apps/admin/.env`.

Para rodar o painel em container Docker com Nginx:

```powershell
docker compose up admin -d --build
```

Abre em `http://localhost:8080`.

## 4. Extensão Chrome (`apps/extension`)

```powershell
pnpm --filter @block-apps/extension build
```

Carregue a pasta `apps/extension/dist` em `chrome://extensions` ativando o modo de desenvolvedor.

## 5. Aplicativo Android (`apps/mobile`)

```powershell
pnpm --filter @block-apps/mobile start
```
