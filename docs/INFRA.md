# Infraestrutura (Terraform)

Toda a infraestrutura AWS vive em `infra/` e só é criada ou alterada por Terraform.

```
infra/
  bootstrap/          bucket S3 do estado (aplicado uma vez, com estado local)
  modules/data        tabela DynamoDB
  modules/auth        Cognito: user pool, grupos, clients, Google, primeiro admin
  modules/api         Lambda, IAM, API Gateway HTTP com authorizer JWT
  environments/dev    junta os módulos
```

## Pré-requisitos

- [Terraform](https://developer.hashicorp.com/terraform/install) 1.9 ou mais novo.
- Credenciais AWS na sessão (por exemplo `aws login` ou `aws sso login`). O AWS CLI serve só para autenticar; nenhum recurso é criado com ele.
- Pacote da API gerado: `pnpm --filter @block-apps/backend package` (fase 2).

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
   Copy-Item backend.hcl.example backend.hcl        # coloque o nome do bucket
   Copy-Item terraform.tfvars.example terraform.tfvars   # e-mail do administrador, prefixo do domínio
   terraform init -backend-config=backend.hcl
   terraform plan -out plan.tfplan
   terraform apply plan.tfplan
   ```

3. Senha temporária do primeiro administrador (trocada no primeiro acesso):

   ```powershell
   terraform output -raw initial_admin_temporary_password
   ```

`backend.hcl`, `terraform.tfvars`, planos e estado **não** vão para o git (já estão no `.gitignore`).

## Login com Google

Crie as credenciais OAuth no Google Cloud (ver `docs/GOOGLE_LOGIN.md`) e preencha `google_client_id` e `google_client_secret` no `terraform.tfvars`. A URL de callback do Google é `https://<hosted_login_domain>/oauth2/idpresponse` (a saída `hosted_login_domain` mostra o domínio).

## Segurança

- Tabela com criptografia, backup contínuo (PITR) e proteção contra exclusão em produção (`protect_from_deletion`).
- Lambda com permissão mínima: só a tabela e o user pool desta stack.
- Cognito com senha mínima de 10 caracteres, MFA opcional (TOTP), revogação de tokens e respostas que não revelam se o e-mail existe.
- API com throttling, logs de acesso e CORS restrito às origens do painel.
- Nunca coloque chaves de acesso no repositório. Para CI, use OIDC.
