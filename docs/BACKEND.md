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

## Rotas da função `admin`

| Rota | O que faz |
| --- | --- |
| `GET /admin/me` | confirma o token de um administrador |
| `GET /admin/users` | lista usuários com papel, cooldown e se falta trocar a senha |
| `POST /admin/users` | convida um usuário por e-mail (`email`, `displayName?`, `role?`, `cooldownHours?`) |
| `PATCH /admin/users/:userId` | altera `displayName`, `role`, `cooldownHours` ou pede `resetPassword` |
| `DELETE /admin/users/:userId` | remove o usuário no Cognito e apaga os dados dele no DynamoDB |

Salvaguardas, todas no código porque o IAM do Cognito não separa grupos nem usuários-alvo:

- O token precisa do grupo `admin`, e **cada chamada confere de novo no Cognito** que o chamador ainda é administrador, está habilitado e já trocou a senha temporária. Token antigo de quem foi rebaixado não vale.
- Ninguém exclui a própria conta nem muda o próprio papel; o último administrador não pode ser rebaixado nem excluído.
- Promover alguém a administrador **reseta a senha** (`AdminResetUserPassword`) e encerra todas as sessões, para não herdar uma senha que outra pessoa já conhecia. Mudar o papel também encerra as sessões.
- Não há senha na API: o usuário novo recebe o convite do Cognito por e-mail (senha temporária, troca obrigatória).

## Testes

Os mesmos testes de API rodam contra um banco em memória e, quando `DYNAMODB_ENDPOINT` existe, contra o DynamoDB local:

```powershell
docker compose -f docker-compose.backend.yml up -d
$env:DYNAMODB_ENDPOINT = 'http://127.0.0.1:8000'
pnpm --filter @block-apps/backend test
```

Sem a variável, só o banco em memória roda. As rotas administrativas rodam contra um Cognito falso (`tests/helpers/cognito/FakeCognito.ts`) que implementa os comandos usados; não existe Cognito local, então o comportamento real só é confirmado depois do primeiro `terraform apply`. O CI sobe o DynamoDB local como serviço.

## Pacote da Lambda

`pnpm --filter @block-apps/backend package` gera `dist/lambda.zip` (esbuild, ESM, SDK da AWS fica de fora porque o runtime já traz). É o arquivo que o Terraform usa (`lambda_zip_path`).

## Limites conhecidos

- O índice `due-changes` usa um balde único (`DUE`). Serve para este volume; com muitos usuários, divida em baldes.
- Ninguém dispara `applyAllDueChanges` ainda (falta o EventBridge Scheduler); hoje as mudanças vencidas são aplicadas quando o próprio usuário chama a API.
- A regra do último administrador é conferida por contagem no Cognito, sem trava atômica: dois administradores rebaixando um ao outro no mesmo instante poderiam zerar os administradores. A saída de emergência é o administrador inicial do Terraform (ou o console do Cognito).
- A listagem de usuários não traz último acesso (o Cognito não guarda esse dado).
- Se apagar os dados de um usuário falhar depois de ele ser removido do Cognito, os itens ficam órfãos no DynamoDB e a chamada devolve 500.
- O cooldown do usuário vive no item `SETTINGS` e ainda não tem rota de escrita: fica em 24h até a fase de administração. Valor inválido (fora de 0 a 168 horas, ou não inteiro) volta para 24h.
- Sem limite de quantidade de regras e dispositivos por usuário.
- Alvos de site são reduzidos ao domínio (`https://www.Exemplo.com/x` vira `exemplo.com`); identificadores de app mantêm a caixa original.
