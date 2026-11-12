# Backend (Lambda + DynamoDB)

Pacote `packages/backend`: API em Hono, use cases pequenos e adaptadores DynamoDB. Duas funções saem do mesmo pacote: `apiHandler` (regras, mudanças pendentes, dispositivos) e `adminHandler` (rotas `/admin/*`). Cada função só lê as variáveis de ambiente de que precisa, na primeira invocação.

```
src/
  domain/        erros, id e normalização de regras, relógio
  rules/         criar e listar regras
  cooldown/      pedido de alteração, remoção, aplicação das mudanças vencidas
  devices/       status de dispositivos
  storage/dynamodb/  chaves, tabelas e adaptadores
  http/          app Hono, autenticação (claims do JWT), rotas, parsing
  composition/   liga stores e use cases
  lambda/        entradas das duas funções
```

## Rotas da função `api`

| Rota | O que faz |
| --- | --- |
| `GET /health` | saúde (sem token) |
| `GET /rules`, `POST /rules` | listar e criar regras |
| `POST /rules/:ruleId/update-requests` | pede mudança de modo/janelas (cooldown) |
| `POST /rules/:ruleId/removal-requests` | pede remoção (cooldown) |
| `GET /pending-changes`, `POST /pending-changes/apply-due`, `DELETE /pending-changes/:ruleId` | ver, aplicar vencidas, cancelar |
| `PUT /devices/:deviceId/status` | informa status do dispositivo |

O `userId` vem sempre do `sub` do token validado pelo API Gateway; nenhuma rota aceita `userId` no corpo. O id de uma regra é `<app|site>~<alvo>` e o alvo é minúsculo, só com letras, dígitos, ponto, hífen e sublinhado.

## Testes

Os mesmos testes de API rodam contra um banco em memória e, quando `DYNAMODB_ENDPOINT` existe, contra o DynamoDB local:

```powershell
docker compose -f docker-compose.backend.yml up -d
$env:DYNAMODB_ENDPOINT = 'http://127.0.0.1:8000'
pnpm --filter @block-apps/backend test
```

Sem a variável, só o banco em memória roda. O CI sobe o DynamoDB local como serviço.

## Pacote da Lambda

`pnpm --filter @block-apps/backend package` gera `dist/lambda.zip` (esbuild, ESM, SDK da AWS fica de fora porque o runtime já traz). É o arquivo que o Terraform usa (`lambda_zip_path`).

## Limites conhecidos

- O índice `due-changes` usa um balde único (`DUE`). Serve para este volume; com muitos usuários, divida em baldes.
- Ninguém dispara `applyAllDueChanges` ainda (falta o EventBridge Scheduler); hoje as mudanças vencidas são aplicadas quando o próprio usuário chama a API.
- `adminHandler` só confere o grupo `admin` e responde `GET /admin/me`. As rotas de usuários vêm na próxima fase.
