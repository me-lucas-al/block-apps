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
- **Variables:** `HOSTED_DOMAIN_PREFIX`, `GOOGLE_CLIENT_ID`, `INITIAL_ADMIN_EMAIL`, `ALARM_EMAIL` (e-mail que recebe os alarmes).
- **Secrets:** `AWS_ROLE_ARN`, `TF_STATE_BUCKET`, `GOOGLE_CLIENT_SECRET`.

O workflow passa esses valores ao Terraform por `TF_VAR_*`, gera `release.tfplan` com `plan -out` e aplica exatamente esse arquivo. O `Terraform Plan` das PRs não usa o ambiente (para não pedir aprovação a cada PR), então crie as mesmas variáveis e segredos também no nível do repositório.

## O que a infraestrutura garante (e o que não)

- **Handlers especializados.** A função `api` só acessa o DynamoDB. A função `admin` acessa o Cognito e exige **MFA TOTP ativo** (`ADMIN_REQUIRE_MFA`, desligável apenas por emergência). A função `scheduler` aplica as mudanças de regras vencidas a cada 5 minutos disparada pelo EventBridge Scheduler.
- **Hospedagem estática segura.** Painel admin servido via CloudFront com Origin Access Control (OAC) sobre bucket S3 privado e cabeçalhos estritos de CSP, X-Frame-Options e nosniff.
- **Observabilidade.** Alarmes CloudWatch para erros 5XX no API Gateway, throttling e p95 de duração na Lambda da API e erros na Lambda `scheduler`, além de alerta de teto de custos no AWS Budgets. Todos os alarmes publicam no tópico SNS `<prefixo>-alarms`; informe `alarm_email` para receber o aviso por e-mail (a AWS envia um link de confirmação na primeira vez).
- Tabela com criptografia, backup contínuo (PITR) e `prevent_destroy`. O user pool também tem `prevent_destroy`; ligue `protect_from_deletion` em produção.
- Cognito: senha mínima de 10 caracteres, MFA configurável com TOTP obrigatório para administradores, revogação de tokens e tokens de acesso de 15 minutos.
- `allow_self_signup` ligado por padrão para cadastro aberto de usuários.
- Suporte a envio de e-mails em produção com SES (`ses_identity_arn` e `ses_from_address`).
- API com throttling (50 por segundo, rota de saúde mais restrita), logs de acesso e CORS restrito às origens do painel.
- Estado em bucket privado, versionado, criptografado, só por TLS, com versões antigas expirando em 90 dias.
- Nunca coloque chaves de acesso no repositório. Para CI, use OIDC.

## Desmontar um ambiente

Com `prevent_destroy` o `terraform destroy` falha de propósito. Para apagar um ambiente de teste, remova temporariamente o bloco `lifecycle { prevent_destroy = true }` dos recursos, desligue `protect_from_deletion`, aplique e então rode o `destroy`. Isso apaga os dados.
