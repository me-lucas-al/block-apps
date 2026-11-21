# Infraestrutura (Terraform)

Toda a infraestrutura AWS vive em `infra/` e só é criada ou alterada por Terraform.

```
infra/
  bootstrap/              bucket S3 do estado (aplicado uma vez, com estado local)
  modules/data            tabela DynamoDB
  modules/auth            Cognito: user pool, grupos, clients, Google, primeiro admin, PreSignUp
  modules/lambda_function uma função Lambda com a própria role, logs e tracing
  modules/api             Lambdas (api, admin, scheduler), API Gateway HTTP, alarmes e scheduler
  modules/admin_site      hospedagem do painel administrativo (S3 privado + CloudFront com OAC e CSP)
  environments/dev        junta os módulos (produção terá o seu próprio diretório)
```

## Pré-requisitos

- [Terraform](https://developer.hashicorp.com/terraform/install) **1.11 ou mais novo** (o bloqueio de estado por arquivo `use_lockfile` exige 1.11).
- Credenciais AWS na sessão (por exemplo `aws login` ou `aws sso login`). O AWS CLI serve só para autenticar; nenhum recurso é criado com ele.
- Pacote da API gerado antes do `plan`: `pnpm --filter @block-apps/backend package`. Sem ele o `plan` falha com a mensagem "O pacote ... não existe". O `validate` não precisa do pacote.

## Validar sem tocar na AWS

```powershell
cd infra/environments/dev
terraform init -backend=false
terraform validate
terraform fmt -recursive -check ..\..
```

No CI (`terraform` em `.github/workflows/ci.yml`), também rodam `tflint --recursive` (com `infra/.tflint.hcl` e plugin `aws`) e `trivy config --ignorefile infra/.trivyignore.yaml --severity HIGH,CRITICAL --exit-code 1 infra/` (que ignora apenas exceções documentadas de custo/arquitetura: CMK em S3/SNS e WAF no CloudFront).

## Primeiro uso

1. **Estado remoto** (uma vez):

   ```powershell
   cd infra/bootstrap
   terraform init
   terraform apply -var state_bucket_name=<nome-unico-do-bucket>
   ```

2. **Ambiente dev**:

   ```powershell
   cd infra/environments/dev
   Copy-Item backend.hcl.example backend.hcl             # coloque o nome do bucket
   Copy-Item terraform.tfvars.example terraform.tfvars   # e-mail do administrador e prefixo do domínio
   terraform init -backend-config=backend.hcl
   terraform plan -out plan.tfplan
   terraform apply plan.tfplan
   ```

   Rode os comandos dentro de `environments/dev`: o caminho do pacote da Lambda é relativo a essa pasta.

3. O primeiro administrador recebe por **e-mail** o convite do Cognito, com a senha temporária (válida por 3 dias, troca obrigatória no primeiro acesso). Nenhuma senha passa pelo estado do Terraform nem pelo terminal.

`backend.hcl`, `terraform.tfvars`, planos e estado **não** vão para o git (estão no `.gitignore`).

## Depois do primeiro acesso do administrador

O usuário inicial e a participação no grupo têm `prevent_destroy`: limpar `initial_admin_email` sem cuidado faria o Terraform tentar apagar a conta, e o `plan` falha de propósito. Para entregar a conta ao uso normal, deixe o Terraform esquecê-la sem apagar:

```hcl
removed {
  from = module.auth.aws_cognito_user_in_group.initial_admin
  lifecycle { destroy = false }
}

removed {
  from = module.auth.aws_cognito_user.initial_admin
  lifecycle { destroy = false }
}
```

e só então limpe `initial_admin_email`.

## Login com Google

Crie as credenciais OAuth no Google Cloud e informe o ID em `google_client_id` no `terraform.tfvars`. A **chave secreta** vai por variável de ambiente, nunca em arquivo: `$env:TF_VAR_google_client_secret = '...'`. A URL de callback autorizada no Google é `https://<hosted_login_domain>/oauth2/idpresponse`.

Contas do Google e contas com senha são vinculadas pelo gatilho **PreSignUp** quando o e-mail do Google já está verificado (`AdminLinkProviderForUser`), evitando contas duplicadas e tomada de conta. O login Google está habilitado no app e na extensão (OAuth code + PKCE); o painel entra só por e-mail, senha e TOTP. Ver "Administrador e login com Google" em `docs/BACKEND.md`.

## Deploy de produção pelo GitHub

O `release.yml` só roda por disparo manual e os jobs de deploy usam o ambiente `production`. Configure em Settings > Environments > `production`:

- **Required reviewers:** quem aprova cada deploy.
- **Deployment branches:** só `main`.
- **Variables:** `HOSTED_DOMAIN_PREFIX`, `GOOGLE_CLIENT_ID`, `INITIAL_ADMIN_EMAIL`, `ALARM_EMAIL` (e-mail que recebe os alarmes), `DNS_HOST` (hostname do resolvedor DoH, veja abaixo; vazio desliga o perfil de DNS) e `DNS_UPSTREAM_URL` (resolvedor público para onde o DoH encaminha o que não é bloqueado, URL `https`; vazio usa `https://1.1.1.1/dns-query`).
- **Secrets:** `AWS_ROLE_ARN`, `TF_STATE_BUCKET`, `GOOGLE_CLIENT_SECRET`.

O job de build da extensão e do painel não usa o ambiente, então crie no nível do repositório as variáveis `API_URL`, `COGNITO_USER_POOL_ID`, `COGNITO_HOSTED_DOMAIN`, `EXTENSION_COGNITO_CLIENT_ID` e `ADMIN_COGNITO_CLIENT_ID` (valores dos outputs do Terraform). O `release.yml` confere essas variáveis antes de empacotar e falha se alguma estiver vazia. Os leitores de configuração dos clientes só lançam erro quando o app abre, não durante o build do Vite.

O workflow passa esses valores ao Terraform por `TF_VAR_*`, gera `release.tfplan` com `plan -out` e aplica exatamente esse arquivo. O `Terraform Plan` das PRs não usa o ambiente (para não pedir aprovação a cada PR), então crie as mesmas variáveis e segredos também no nível do repositório.

## Host do resolvedor DNS (`dns_host`)

A Lambda `api` gera o perfil iOS `GET /dns/profile.mobileconfig` apontando para `https://<dns_host>/dns-query/<token>`. O host vem da variável Terraform `dns_host` (módulo `api` e ambiente `dev`), que vira a variável de ambiente `DNS_HOST` da Lambda. Em produção, defina a variável `DNS_HOST` do GitHub (usada em `release.yml` e `terraform-plan.yml` como `TF_VAR_dns_host`); localmente, use `dns_host` no `terraform.tfvars`.

- O valor precisa ser só o hostname em minúsculas (`dns.exemplo.com`), sem `https://`, porta, caminho ou espaço. O Terraform recusa outro formato no `plan` e a Lambda falha ao atender a primeira chamada com o log `invalid dns host configuration`.
- Ele precisa casar com o domínio público do resolvedor DoH: é esse nome que o iPhone vai consultar, com o certificado TLS correspondente. A Lambda `dns` recebe o mesmo `DNS_HOST` (via `var.dns_host`), para os dois lados ficarem alinhados.
- Vazio (padrão) desliga o recurso: a rota responde `404 dns blocking is not configured` e nenhum perfil é gerado.
- **O Terraform não cria o domínio nem o certificado.** O hostname `dns_host` precisa de um domínio personalizado do API Gateway (ou outra frente) com certificado ACM e registro DNS apontando para a API, criados à parte. Sem isso o perfil aponta para um nome que não resolve.

## Resolvedor DoH (Lambda `dns`)

O módulo `api` publica a função `<prefixo>-dns` (handler `index.dnsHandler`, mesmo pacote `lambda.zip`) e as rotas abertas `GET /dns-query/{token}` e `POST /dns-query/{token}`.

- **Rotas abertas, e só elas.** As duas rotas usam `authorization_type = NONE`: o iPhone não manda JWT, e o segredo é o token do caminho. Elas são mais específicas que a rota gulosa `ANY /{proxy+}` (JWT), que continua valendo para todo o resto. A permissão de invocação da Lambda restringe o `source_arn` a `.../*/*/dns-query/*`.
- **IAM mínimo e só de leitura.** A role da `dns` é própria (não reaproveita a da `api`) e só tem `dynamodb:GetItem` e `dynamodb:Query` na tabela (sem o índice `due-changes`, sem escrita).
- **Ambiente.** `TABLE_NAME`, `DNS_UPSTREAM_URL` (URL `https`, validada no Terraform e na Lambda; padrão `https://1.1.1.1/dns-query`) e `DNS_HOST`. Timeout de 3 segundos (`dns_timeout_seconds`); o upstream tem teto de 2 segundos.
- **Concorrência.** `dns_reserved_concurrent_executions` (padrão `-1`, sem reserva) isola a rota aberta do resto da conta. Contas novas com limite baixo de concorrência não conseguem reservar; depois de aumentar a cota, reserve um valor (por exemplo 50) para um pico de consultas não consumir a concorrência da API.
- **Throttling próprio.** As rotas têm `route_settings` com `dns_throttling_rate_limit` (500 por segundo) e `dns_throttling_burst_limit` (1000), bem acima do padrão da API (50 e 100), porque uma tela abre dezenas de consultas de uma vez e o limite é por rota, somando todos os usuários. Acima disso o API Gateway responde `429` e o aparelho fica sem resolver DNS: ajuste ao volume real.
- **Alarmes.** `dns-query-4xx` (4xx somando GET e POST nas rotas, que inclui o `429` de throttling: o HTTP API não tem métrica separada; as rotas têm `detailed_metrics_enabled`; limite `dns_client_error_alarm_threshold`), `dns-lambda-throttles` (Lambda `dns` limitada pela concorrência) e um alarme por métrica do resolvedor no namespace `BlockApps/Dns` (métricas EMF gravadas no log da Lambda): `DnsFailOpen` (qualquer ocorrência alarma), `DnsTokenLookupFailure` e `DnsUpstreamFailure`. Todos publicam no tópico `<prefixo>-alarms`.
- **O log de acesso não grava o caminho.** O formato do log de acesso usa `$context.routeKey` (que mostra `/dns-query/{token}`) e não inclui `$context.path` nem `requestOverride`, porque o token está no caminho. Não adicione esses campos.
- **Ordem de publicação.** Primeiro `terraform apply` (cria a função, as rotas e os alarmes, e exige `lambda.zip` com o `dnsHandler`, então empacote antes), depois o `release.yml`. Defina antes as variáveis `DNS_HOST` e `DNS_UPSTREAM_URL` do GitHub, e o domínio e o certificado do hostname.

## O que a infraestrutura garante (e o que não)

- **Handlers especializados.** A função `api` só acessa o DynamoDB. A função `admin` acessa o Cognito e exige **MFA TOTP ativo** (`ADMIN_REQUIRE_MFA`, desligável apenas por emergência). A função `scheduler` aplica as mudanças de regras vencidas a cada 5 minutos disparada pelo EventBridge Scheduler.
- **Hospedagem estática segura.** Painel admin servido via CloudFront com Origin Access Control (OAC) sobre bucket S3 privado e cabeçalhos estritos de CSP, X-Frame-Options e nosniff.
- **Observabilidade.** Alarmes CloudWatch para erros 5XX no API Gateway, throttling e p95 de duração na Lambda da API e erros na Lambda `scheduler`, além de alerta de teto de custos no AWS Budgets. Todos os alarmes publicam no tópico SNS `<prefixo>-alarms`; informe `alarm_email` para receber o aviso por e-mail (a AWS envia um link de confirmação na primeira vez).
- Tabela com criptografia, backup contínuo (PITR) e `prevent_destroy`. O user pool também tem `prevent_destroy`; ligue `protect_from_deletion` em produção.
- Cognito: senha mínima de 10 caracteres, MFA configurável com TOTP obrigatório para administradores, revogação de tokens e tokens de acesso de 15 minutos.
- `allow_self_signup` ligado por padrão para cadastro aberto de usuários.
- Suporte a envio de e-mails em produção com SES (`ses_identity_arn` e `ses_from_address`).
- API com throttling (50 por segundo, rotas de saúde e `POST /dns/rotate` mais restritas: 2 por segundo, rajada de 5, e as rotas do resolvedor DoH com limite próprio e alto), logs de acesso e CORS restrito às origens do painel.
- Estado em bucket privado, versionado, criptografado, só por TLS, com versões antigas expirando em 90 dias.
- Nunca coloque chaves de acesso no repositório. Para CI, use OIDC.

## Desmontar um ambiente

Com `prevent_destroy` o `terraform destroy` falha de propósito. Para apagar um ambiente de teste, remova temporariamente o bloco `lifecycle { prevent_destroy = true }` dos recursos, desligue `protect_from_deletion`, aplique e então rode o `destroy`. Isso apaga os dados.
