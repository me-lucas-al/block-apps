# Backend (Lambda + DynamoDB)

Pacote `packages/backend`: API em Hono, use cases pequenos e adaptadores DynamoDB e Cognito. Cinco funções saem do mesmo pacote: `apiHandler` (regras, mudanças pendentes, dispositivos), `adminHandler` (rotas `/admin/*`), `dnsHandler` (resolvedor DNS sobre HTTPS, rotas `/dns-query/*`), `preSignUpHandler` (gatilho do Cognito que vincula o login do Google à conta de mesmo e-mail) e `schedulerHandler` (aplica as mudanças vencidas a cada 5 minutos). Cada função só lê as variáveis de ambiente de que precisa, na primeira invocação.

```
src/
  domain/        erros, id e normalização de regras, relógio
  rules/         criar e listar regras
  cooldown/      pedido de alteração, remoção, aplicação das mudanças vencidas
  devices/       status de dispositivos
  dns/           token, fuso e perfil de DNS (contratos de gravação e de validação do token), resolver/ (cache, pacotes DNS, regras), upstream/ (cliente DoH)
  users/         use cases, guardas e contratos das rotas administrativas
  auth/          vínculo entre login do Google e conta com senha (PreSignUp)
  storage/       adaptadores DynamoDB (chaves, tabelas) e Cognito
  http/          app Hono, autenticação (claims do JWT), rotas, parsing
  composition/   liga stores e use cases
  lambda/        entradas das cinco funções
```

## Modelo de dados

Uma única tabela DynamoDB (`<prefixo>-data`), cobrança por demanda, com recuperação em ponto no tempo e criptografia. Chave de partição `pk` e de ordenação `sk`, as duas texto. Tudo de um usuário fica na mesma partição, `USER#<userId>` (o `sub` do Cognito), então apagar um usuário é consultar uma partição só.

| Item | `pk` | `sk` | Atributos |
| --- | --- | --- | --- |
| Regra | `USER#<userId>` | `RULE#<ruleId>` | `id`, `targetType` (`app`, `site` ou `keyword`), `target`, `mode`, `windows` |
| Mudança pendente | `USER#<userId>` | `CHANGE#<ruleId>` | `ruleId`, `kind` (`update`, `delete` ou `selectionRemoval`), `mode`, `windows` (nulos em `delete` e `selectionRemoval`), `effectiveAt`, `dueBucket` (sempre `DUE`) |
| Configuração | `USER#<userId>` | `SETTINGS` | `cooldownHours` |
| Dispositivo | `USER#<userId>` | `DEVICE#<deviceId>` | `deviceId`, `platform`, `incognitoAllowed`, `adminActive`, `lastSeen` |
| Perfil de DNS | `USER#<userId>` | `DNS` | `token`, `tokenHash` (SHA-256 hex), `timeZone` (IANA), `createdAt` (criação do perfil, nunca muda), `tokenCreatedAt` (criação ou última rotação do token) |
| Busca do token de DNS | `DNSTOKEN#<tokenHash>` | `DNSTOKEN` | `userId` (índice de busca: não vale sozinho, ver "Token de DNS") |

Há uma mudança pendente por regra (a chave usa o `ruleId`), então pedir de novo substitui o pedido anterior.

Índice secundário global `due-changes`: chave de partição `dueBucket`, de ordenação `effectiveAt`, projeção `ALL`. O `schedulerHandler` consulta o balde `DUE` até o instante atual para achar quem tem mudança vencida.

### Token de DNS

- **Validação.** O contrato `DnsTokenLookup` (`findValidatedDnsOwner(tokenHash)`) é a única forma de o resolvedor aceitar um token. Ele lê o item de busca `DNSTOKEN#<hash>`, depois o item `DNS` do usuário apontado (as duas leituras com `ConsistentRead`) e só devolve `{ userId, dnsSettings }` se o `tokenHash` do item `DNS` for igual ao hash buscado. Um item de busca órfão (usuário apagado, falha parcial da exclusão, rotação concorrente) nunca valida, porque o item `DNS` não existe ou guarda outro token. Item `DNS` malformado também não valida: a leitura falha com `MalformedDnsSettingsError`.
- **Token em claro (decisão consciente).** O token fica em claro no item `DNS`, porque `POST /dns/profile` precisa devolvê-lo de novo para montar o perfil no aparelho; só o item de busca usa o hash. Não há HMAC nem KMS nesta etapa. Mitigações: o token é aleatório (32 bytes, base64url, 43 caracteres), a tabela é criptografada, as respostas das rotas `/dns` levam `Cache-Control: private, no-store`, o log nunca grava o token e a rotação (`POST /dns/rotate`) invalida o anterior na hora.
- **Quem lê o token.** O backup contínuo (PITR) retém versões antigas do item `DNS`, tokens inclusive, por até 35 dias depois da rotação ou da exclusão. A role `data-reader` (`infra/modules/data/reader_role.tf`) lê a tabela inteira, então **consegue ler os tokens de DNS**: o IAM não filtra por `sk`, e filtrar por atributo quebraria o console. Risco aceito: a role exige MFA e é só para pessoas da conta; para anular um token vazado, rotacione-o.
- **Gravações condicionais.** Criar o perfil, trocar o token e mudar o fuso usam condição (`attribute_not_exists` na criação; `tokenHash` igual ao lido na troca do fuso; `tokenHash` e `timeZone` iguais aos lidos na rotação) e o item de busca novo entra com `attribute_not_exists(pk)`. Quem perde a corrida recebe 409 e tenta de novo. Se `POST /dns/profile` perde a corrida de criação, relê o perfil e reaplica o fuso pedido (ou responde 409), nunca devolve em silêncio um fuso diferente.
- **Fuso.** Validado e gravado pelo nome canônico (`America/Sao_Paulo`, ou `UTC`); abreviações como `EST` e offsets como `+03:00` são recusados.
- **Exclusão.** O apagador de usuário remove primeiro as chaves de busca do DNS (lidas do `tokenHash` do item `DNS`) e só depois o item `DNS` e o resto. Se ele falhar no meio ou uma rotação cair entre a leitura e a exclusão, sobra no máximo um item de busca órfão (lixo sem valor: não valida).
- **Limite de taxa.** `POST /dns/rotate` tem rota própria no API Gateway com limite menor (2 por segundo, rajada de 5), somado ao limite padrão da API.

### Riscos do desenho

- O balde `DUE` é único: todas as mudanças pendentes caem numa partição do índice. Serve para este volume; com muitos usuários, divida em baldes (`DUE#0`, `DUE#1`, ...).
- O `userId` está no `pk` e no token. Nada na API aceita `userId` no corpo; qualquer rota nova precisa tirá-lo só do token.
- Itens órfãos: se a exclusão dos dados falhar depois de o usuário sair do Cognito, eles ficam na tabela (ver "Limites conhecidos").
- O `lastSeen` do dispositivo vem do relógio da Lambda, não do aparelho.

## Rotas da função `api`

| Rota | O que faz |
| --- | --- |
| `GET /health` | saúde (sem token) |
| `GET /rules`, `POST /rules` | listar e criar regras (acima da cota responde 422 com `code: "rule-quota-exceeded"`) |
| `POST /rules/:ruleId/update-requests` | pede mudança de modo/janelas (cooldown) |
| `POST /rules/:ruleId/removal-requests` | pede remoção (cooldown) |
| `GET /pending-changes`, `POST /pending-changes/apply-due`, `DELETE /pending-changes/:ruleId` | ver, aplicar vencidas, cancelar |
| `PUT /devices/:deviceId/status` | informa status do dispositivo |
| `POST /dns/profile`, `POST /dns/rotate` | cria ou devolve o token de DNS do usuário (e grava o fuso IANA enviado em `timeZone`), troca o token |
| `GET /dns/profile.mobileconfig` | devolve o perfil iOS (`.mobileconfig`) com o DNS seguro do usuário; exige JWT e que o perfil já tenha sido criado (ver "Perfil de DNS no iPhone") |

O `userId` vem sempre do `sub` do token validado pelo API Gateway; nenhuma rota aceita `userId` no corpo. O id de uma regra é `<app|site>~<alvo>` e o alvo é minúsculo, só com letras, dígitos, ponto, hífen e sublinhado.

## Perfil de DNS no iPhone

`GET /dns/profile.mobileconfig` monta o perfil de configuração do iOS (`com.apple.dnsSettings.managed`, protocolo `HTTPS`) com `ServerURL = https://<DNS_HOST>/dns-query/<token>`.

- **`DNS_HOST`.** Hostname do resolvedor DoH, só o nome em minúsculas (sem `https://`, porta, caminho ou espaço). Vem do Terraform (`dns_host`, ver `docs/INFRA.md`). Sem valor a rota responde `404` antes de ler o banco; com formato inválido a Lambda `api` registra o log JSON `invalid dns host configuration` e falha ao atender a primeira chamada. Na API local, defina `DNS_HOST` antes de subir.
- **Respostas.** `404` se o recurso estiver desligado (sem `DNS_HOST`) ou se o usuário ainda não chamou `POST /dns/profile`; `401` sem JWT válido. Em sucesso: `200` com `Content-Type: application/x-apple-aspen-config; charset=utf-8`, `Content-Disposition: attachment; filename="block-apps-dns.mobileconfig"`, `Cache-Control: private, no-store` e `X-Content-Type-Options: nosniff` (os dois últimos valem para todas as rotas `/dns`).
- **Identificadores estáveis.** Os `PayloadUUID` e os `PayloadIdentifier` derivam do `userId`, então a rotação do token troca só a `ServerURL` e o iOS trata o perfil novo como atualização do mesmo perfil.
- **Instalação.** A rota exige o JWT, e o Safari não envia o cabeçalho `Authorization`. Por isso o app baixa o corpo da resposta com o Bearer e entrega o arquivo ao iOS pelo share sheet ou como arquivo; abrir o link no navegador devolve `401`. Depois o usuário confirma em Ajustes > Geral > VPN e Gerenciamento de Dispositivo.
- **Sem assinatura e removível.** O perfil não é assinado (o iOS o mostra como "Não assinado") e o usuário pode removê-lo a qualquer momento (o perfil usa `PayloadRemovalDisallowed = false`, e o iOS só impede a remoção de perfis instalados por MDM ou em dispositivo supervisionado). É um limite conhecido do bloqueio por DNS sem MDM: quem remove o perfil desliga o bloqueio de sites.

## Resolvedor DNS sobre HTTPS

A função `dns` (`dnsHandler`) responde ao DNS do iPhone: bloqueia os sites das regras do usuário e encaminha o resto a um resolvedor público. Ela só lê o banco (`GetItem` e `Query`).

- **Rotas públicas, sem JWT.** `GET /dns-query/{token}?dns=<base64url>` e `POST /dns-query/{token}` (corpo `application/dns-message`, RFC 8484). O token do caminho é a credencial: 43 caracteres base64url, o mesmo formato de `generateDnsToken`.
- **Ordem das verificações, antes de qualquer acesso ao banco.** 1) formato do token (malformado: `404` vazio, sem hash nem leitura); 2) tamanho e leitura da mensagem; 3) decodificação e validação da mensagem DNS; só então a busca do token. Respostas: `404` token malformado ou desconhecido, `415` tipo de mídia que não é `application/dns-message`, `413` acima de 512 bytes (no GET, o parâmetro `dns` tem teto de 683 caracteres, antes de decodificar; no POST, vale o `Content-Length` e a leitura do corpo para ao passar de 512 bytes), `400` parâmetro `dns` ausente ou vazio, corpo vazio, base64url inválido, mensagem que não é consulta DNS ou que traz mais (ou menos) de uma pergunta. Sucesso: `200` com `application/dns-message` e `Cache-Control: no-store`.
- **Bloqueio.** Regras `site` casam o domínio e seus subdomínios, no modo `always` ou `schedule` (a janela é o horário **liberado**; fora dela bloqueia). `A` responde `0.0.0.0` e `AAAA` responde `::`, TTL 30; outros tipos (como `HTTPS`) respondem `NOERROR` vazio. O que não é bloqueado vai ao upstream.
- **`DNS_UPSTREAM_URL`.** URL `https` do resolvedor público (padrão `https://1.1.1.1/dns-query`). Outro esquema, URL inválida ou URL com usuário e senha fazem a função falhar na primeira chamada, com o log `invalid dns upstream configuration` (sem o valor). O cliente não segue redirecionamentos, tem timeout de 2 segundos, aceita no máximo 4096 bytes de resposta e exige resposta de pelo menos 12 bytes com o mesmo `id` da consulta; qualquer falha vira `SERVFAIL`.
- **SERVFAIL.** O resolvedor responde uma mensagem DNS válida com `SERVFAIL` (mesmo `id` e pergunta da consulta) quando o upstream falha e quando a busca do token falha (erro do DynamoDB sem cache). Nunca devolve `500` vazio por falha de leitura.
- **Cache por container (memória da Lambda).** O token vale por até **60 s** depois de uma rotação (cache do dono do token); regras e fuso mudam no resolvedor em até **30 s**. Token desconhecido fica em cache negativo por **10 s**, para uma sonda não gerar uma leitura por requisição. Cada cache guarda até 5000 entradas (a mais antiga sai primeiro). Se a leitura falha, o cache velho serve por no máximo **10 minutos** (`staleUsableMs` em `dnsCacheTimings.ts`); depois disso vale a regra abaixo.
- **Fail-open (decisão do dono, intencional).** Se a leitura das regras falha e não há cache utilizável, a consulta é liberada ao upstream em vez de derrubar o DNS do aparelho. Isso desliga o bloqueio durante a falha. Cada ocorrência grava uma métrica EMF `DnsFailOpen` (namespace `BlockApps/Dns`) e um log JSON `dns rules load failed; failing open`, sem token, e o alarme `<prefixo>-dns-dnsfailopen` avisa. Também são métricas EMF `DnsTokenLookupFailure` e `DnsUpstreamFailure`.
- **Limite de taxa.** As rotas têm limite próprio no API Gateway (ver `docs/INFRA.md`); acima dele o aparelho recebe `429` e fica sem DNS.
- **Limites conhecidos.** A cadeia `CNAME` não é tratada: só o nome perguntado é comparado com as regras, então um domínio liberado que aponta por `CNAME` para um domínio bloqueado passa. A hora da janela vem de `toZonedDate`, que monta uma data com os componentes do fuso do usuário e depende do fuso do processo (`TZ`) para ler dia e hora; a Lambda roda em UTC, e um fuso de processo com horário de verão pode errar uma hora na transição. Fuso do usuário inválido cai em UTC.

## Cota de regras

Cada usuário pode ter até `MAX_RULES_PER_USER` regras (padrão 200). Ao criar a regra seguinte o backend responde `422` com `{ error, code: "rule-quota-exceeded", maxRulesPerUser }`. Uma remoção só libera a vaga quando entra em vigor (depois do cooldown), porque a regra continua valendo até lá; mudanças pendentes só alteram ou removem regras e nunca criam, então não entram na conta. O valor precisa ser um inteiro decimal positivo (`1e3`, `0x10` e espaços são recusados); se for inválido a Lambda `api` registra um log JSON `invalid rule limit configuration` e falha ao atender a primeira chamada. No Terraform o valor vem de `max_rules_per_user` (módulo `api` e ambiente `dev`). Na API local, defina `MAX_RULES_PER_USER` antes de subir (`$env:MAX_RULES_PER_USER = '5'` com `pnpm --filter @block-apps/backend local`, ou no ambiente do `docker compose -f docker-compose.local.yml`); o padrão é 200.

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
- Sem limite de quantidade de dispositivos por usuário.
- A cota de regras (`MAX_RULES_PER_USER`) é conferida antes de gravar, sem trava atômica: N criações simultâneas do mesmo usuário, todas lendo a contagem antes de qualquer gravação, passam juntas e o excesso pode chegar a N-1 regras acima do limite. Um contador atômico fica para quando for preciso um limite rígido.
- Alvos de site são reduzidos ao domínio (`https://www.Exemplo.com/x` vira `exemplo.com`); identificadores de app mantêm a caixa original.
