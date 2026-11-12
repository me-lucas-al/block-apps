# Infraestrutura (Terraform)

Toda a infraestrutura AWS vive em `infra/` e só é criada ou alterada por Terraform.

```
infra/
  bootstrap/              bucket S3 do estado (aplicado uma vez, com estado local)
  modules/data            tabela DynamoDB
  modules/auth            Cognito: user pool, grupos, clients, Google, primeiro administrador
  modules/lambda_function uma função Lambda com a própria role, logs e tracing
  modules/api             duas Lambdas (api e admin) atrás de um API Gateway HTTP com authorizer JWT
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

Contas do Google e contas com senha **não são vinculadas** automaticamente: a mesma pessoa que usar os dois métodos terá duas identidades. A vinculação segura (só quando o e-mail nativo já está verificado) fica para uma fase seguinte. O login com Google existe no painel; o app e a extensão usam e-mail e senha.

## O que a infraestrutura garante (e o que não)

- **Duas Lambdas, duas roles.** A função `api` (regras, dispositivos) só acessa o DynamoDB. A função `admin` é a única com as ações de administração do Cognito, e só responde em `/admin/*`. O IAM do Cognito não distingue grupos nem usuários-alvo, então **quem barra um usuário comum nas rotas administrativas é o código** (checagem do grupo `admin` no token e, em ações destrutivas, no Cognito).
- Tabela com criptografia, backup contínuo (PITR) e `prevent_destroy`. O user pool também tem `prevent_destroy`; ligue `protect_from_deletion` em produção.
- Cognito: senha mínima de 10 caracteres, MFA opcional (TOTP), revogação de tokens, tokens de acesso de 15 minutos e respostas que não revelam se um e-mail existe. Sem grupo é tratado como negação.
- `allow_self_signup` (padrão ligado) controla o cadastro aberto. Desligado, só administradores criam usuários.
- O Cognito usa o remetente padrão (cerca de 50 e-mails por dia). Em produção informe `ses_identity_arn` e `ses_from_address`.
- API com throttling (50 por segundo, rota de saúde mais restrita), logs de acesso e CORS restrito às origens do painel.
- Estado em bucket privado, versionado, criptografado, só por TLS, com versões antigas expirando em 90 dias.
- Nunca coloque chaves de acesso no repositório. Para CI, use OIDC.

## Desmontar um ambiente

Com `prevent_destroy` o `terraform destroy` falha de propósito. Para apagar um ambiente de teste, remova temporariamente o bloco `lifecycle { prevent_destroy = true }` dos recursos, desligue `protect_from_deletion`, aplique e então rode o `destroy`. Isso apaga os dados.
