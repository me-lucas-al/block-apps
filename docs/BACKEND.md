# Backend (Lambda + DynamoDB)

Pacote `packages/backend`: API em Hono, use cases pequenos e adaptadores DynamoDB e Cognito. Quatro funções saem do mesmo pacote: `apiHandler` (regras, mudanças pendentes, dispositivos), `adminHandler` (rotas `/admin/*`), `preSignUpHandler` (gatilho do Cognito que vincula o login do Google à conta de mesmo e-mail) e `schedulerHandler` (aplica as mudanças vencidas a cada 5 minutos). Cada função só lê as variáveis de ambiente de que precisa, na primeira invocação.

```
src/
  domain/        erros, id e normalização de regras, relógio
  rules/         criar e listar regras
  cooldown/      pedido de alteração, remoção, aplicação das mudanças vencidas
  devices/       status de dispositivos
  users/         use cases, guardas e contratos das rotas administrativas
  auth/          vínculo entre login do Google e conta com senha (PreSignUp)
  storage/       adaptadores DynamoDB (chaves, tabelas) e Cognito
  http/          app Hono, autenticação (claims do JWT), rotas, parsing
  composition/   liga stores e use cases
  lambda/        entradas das quatro funções
```

## Modelo de dados

Uma única tabela DynamoDB (`<prefixo>-data`), cobrança por demanda, com recuperação em ponto no tempo e criptografia. Chave de partição `pk` e de ordenação `sk`, as duas texto. Tudo de um usuário fica na mesma partição, `USER#<userId>` (o `sub` do Cognito), então apagar um usuário é consultar uma partição só.

| Item | `pk` | `sk` | Atributos |
| --- | --- | --- | --- |
| Regra | `USER#<userId>` | `RULE#<ruleId>` | `id`, `targetType` (`app`, `site` ou `keyword`), `target`, `mode`, `windows` |
| Mudança pendente | `USER#<userId>` | `CHANGE#<ruleId>` | `ruleId`, `kind` (`update` ou `delete`), `mode`, `windows`, `effectiveAt`, `dueBucket` (sempre `DUE`) |
| Configuração | `USER#<userId>` | `SETTINGS` | `cooldownHours` |
| Dispositivo | `USER#<userId>` | `DEVICE#<deviceId>` | `deviceId`, `platform`, `incognitoAllowed`, `adminActive`, `lastSeen` |

Há uma mudança pendente por regra (a chave usa o `ruleId`), então pedir de novo substitui o pedido anterior.

Índice secundário global `due-changes`: chave de partição `dueBucket`, de ordenação `effectiveAt`, projeção `ALL`. O `schedulerHandler` consulta o balde `DUE` até o instante atual para achar quem tem mudança vencida.

### Riscos do desenho

- O balde `DUE` é único: todas as mudanças pendentes caem numa partição do índice. Serve para este volume; com muitos usuários, divida em baldes (`DUE#0`, `DUE#1`, ...).
- O `userId` está no `pk` e no token. Nada na API aceita `userId` no corpo; qualquer rota nova precisa tirá-lo só do token.
- Itens órfãos: se a exclusão dos dados falhar depois de o usuário sair do Cognito, eles ficam na tabela (ver "Limites conhecidos").
- O `lastSeen` do dispositivo vem do relógio da Lambda, não do aparelho.

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

- O token precisa do grupo `admin`, e **cada chamada confere de novo no Cognito** que o chamador ainda é administrador, está habilitado e já trocou a senha temporária. Token antigo de quem foi rebaixado não vale. O chamador e o alvo são achados pelo `sub` (que é o `userId` da API), inclusive contas do Google, cujo `Username` no Cognito é outro.
- `:userId` precisa ser um UUID: e-mail na URL é recusado, para que a regra de auto-exclusão compare sempre o id canônico.
- Ninguém exclui a própria conta nem muda o próprio papel; o último administrador não pode ser rebaixado nem excluído.
- Promover alguém a administrador **reseta a senha** (`AdminResetUserPassword`) *antes* de mudar o grupo e encerra as sessões, para não herdar uma senha que outra pessoa já conhecia; se o reset falhar, o papel não muda. Quem ainda não definiu senha (convite pendente) ou entra pelo Google não tem senha para resetar, então a promoção não faz reset, e `resetPassword: true` nesses casos devolve 400. Trocar o papel remove o grupo antigo antes de adicionar o novo, e encerra as sessões.
- "Último administrador" conta só administradores utilizáveis (habilitados, com senha definida). Como o chamador também precisa ser um administrador utilizável e não age sobre si mesmo, a trava só dispara numa corrida.
- Criar usuário desfaz a criação no Cognito se gravar o cooldown falhar.
- Não há senha na API: o usuário novo recebe o convite do Cognito por e-mail (senha temporária, troca obrigatória).
- Com `ADMIN_REQUIRE_MFA` ligada (padrão), o administrador também precisa ter TOTP ativo; sem isso as rotas respondem 403 e o painel leva o administrador ao cadastro do TOTP.

### Administrador e login com Google

O painel só entra por e-mail, senha e TOTP: o client do painel no Cognito não tem login do Google. O Google vale no app e na extensão. Por isso:

1. Convide a pessoa pelo painel (ou pelo `initial_admin_email` do Terraform) usando o **mesmo e-mail** que ela usa no Google. A conta nasce com uma senha temporária enviada por e-mail.
2. A pessoa troca a senha temporária e cadastra o TOTP no primeiro acesso ao painel. Só depois disso ela é um administrador utilizável.
3. Se ela entrar no app ou na extensão com o Google *depois* de a conta estar confirmada, o PreSignUp vincula o Google à conta existente: é o mesmo `sub`, então o papel de administrador e os dados continuam os mesmos.
4. Se a pessoa entrar com o Google *antes* de definir a senha do convite, o Cognito cria uma conta separada (`Google_...`, outro `sub`) com papel `user`. Promovê-la a administrador não ajuda, porque ela não tem senha para o painel. Peça que defina a senha do convite e use essa conta.

Só se vincula conta nativa confirmada, habilitada e com e-mail verificado; qualquer outra situação cria a conta do Google separada.

## Testes

Os mesmos testes de API rodam contra um banco em memória e, quando `DYNAMODB_ENDPOINT` existe, contra o DynamoDB local:

```powershell
docker compose -f docker-compose.backend.yml up -d
$env:DYNAMODB_ENDPOINT = 'http://127.0.0.1:8000'
pnpm --filter @block-apps/backend test
```

Sem a variável, só o banco em memória roda. As rotas administrativas rodam contra um Cognito falso (`src/local/cognito/FakeCognito.ts`) que implementa os comandos usados; não existe Cognito local, então o comportamento real só é confirmado depois do primeiro `terraform apply`. O CI sobe o DynamoDB local como serviço.

## API local (Docker ou Node)

Serve a mesma API Hono (rotas `api` e `/admin`) fora da Lambda, sobre o DynamoDB local, para os clientes testarem sem AWS:

```powershell
docker compose -f docker-compose.local.yml up -d --build
```

Sobe DynamoDB local e a API em `http://127.0.0.1:3000` (só no seu computador). A tabela é criada sozinha e os dados somem ao derrubar (`down`). Sem Docker para a API (usando o DynamoDB de `docker-compose.backend.yml`):

```powershell
$env:DYNAMODB_ENDPOINT = 'http://127.0.0.1:8000'
pnpm --filter @block-apps/backend local
```

**Login de desenvolvimento:** não existe Cognito local, então o servidor aceita um token falso no formato `Authorization: Bearer dev:<userId>:<grupos>`. Dois usuários já existem, e o servidor imprime os tokens ao subir:

- administrador: `Bearer dev:00000000-0000-4000-8000-0000000000a1:admin`
- usuário comum: `Bearer dev:00000000-0000-4000-8000-0000000000b1:user`

```powershell
curl.exe http://127.0.0.1:3000/health
curl.exe -X POST http://127.0.0.1:3000/rules -H "Authorization: Bearer dev:00000000-0000-4000-8000-0000000000b1:user" -H "content-type: application/json" -d '{\"targetType\":\"site\",\"target\":\"exemplo.com\",\"mode\":\"always\"}'
```

As rotas `/admin` usam um Cognito falso em memória (`src/local/cognito`) com esses dois usuários. O servidor local **nunca vai no zip da Lambda** (um teste confere o bundle) e não valida senha nem assinatura de token, por isso:

- só aceita requisições com `Host` local (`localhost`, `127.0.0.1`, `[::1]`), o que barra DNS rebinding;
- CORS só libera `http://localhost:*`, `http://127.0.0.1:*`, extensões do Chrome e as origens de `LOCAL_ALLOWED_ORIGINS` (lista separada por vírgula); outros hosts entram por `LOCAL_ALLOWED_HOSTS`;
- recusa subir se houver sinais de ambiente AWS (Lambda, ECS, token de identidade), se `DYNAMODB_ENDPOINT` não for um DynamoDB local ou se `HOST` não for loopback (o compose libera isso com `LOCAL_API_ALLOW_REMOTE_HOST=true` e publica só em `127.0.0.1`);
- no Docker roda sem root, com sistema de arquivos somente leitura e sem capacidades extras. Nunca publique essa porta com `-p 3000:3000` fora do compose.

## Pacote da Lambda

`pnpm --filter @block-apps/backend package` gera `dist/lambda.zip` (esbuild, ESM, SDK da AWS fica de fora porque o runtime já traz). É o arquivo que o Terraform usa (`lambda_zip_path`).

## Limites conhecidos

- O índice `due-changes` usa um balde único (`DUE`). Serve para este volume; com muitos usuários, divida em baldes.
- O EventBridge Scheduler aciona o `schedulerHandler` a cada 5 minutos; além disso as mudanças vencidas de um usuário são aplicadas quando ele chama a API.
- A regra do último administrador é conferida por contagem no Cognito, sem trava atômica: dois administradores rebaixando um ao outro no mesmo instante poderiam zerar os administradores. A saída de emergência é o administrador inicial do Terraform (ou o console do Cognito).
- Depois de excluir ou rebaixar alguém, o token de acesso já emitido vale até 15 minutos nas rotas comuns (`api`), que não consultam o Cognito; as rotas `admin` consultam a cada chamada.
- A listagem lê o cooldown de cada usuário no DynamoDB e não tem paginação: serve para algumas centenas de usuários.
- Depois do reset de senha o usuário fica em `RESET_REQUIRED` e precisa do fluxo "esqueci a senha"; o painel, o app e a extensão têm a tela para isso.
- A listagem de usuários não traz último acesso (o Cognito não guarda esse dado).
- Se apagar os dados de um usuário falhar depois de ele ser removido do Cognito, os itens ficam órfãos no DynamoDB e a chamada devolve 500.
- O cooldown do usuário vive no item `SETTINGS` e um administrador o define ao convidar ou em `PATCH /admin/users/:userId` (`cooldownHours`). Sem o item, vale 24h; valor inválido (fora de 0 a 168 horas, ou não inteiro) também volta para 24h.
- Se o `schedulerHandler` falhar ao aplicar as mudanças de algum usuário, ele termina os demais e então lança `DueChangesApplicationError` (a mensagem traz a contagem e os 5 primeiros ids). A Lambda registra erro, o alarme `scheduler-errors` dispara e o próximo tick de 5 minutos tenta de novo; não há retry automático na Lambda.
- Sem limite de quantidade de regras e dispositivos por usuário.
- Alvos de site são reduzidos ao domínio (`https://www.Exemplo.com/x` vira `exemplo.com`); identificadores de app mantêm a caixa original.
