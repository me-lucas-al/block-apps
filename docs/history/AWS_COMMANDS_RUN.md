# Registro de Comandos Executados na AWS e Terraform

Este documento detalha todos os comandos do AWS CLI, Terraform e scripts de verificação executados durante o processo de migração e deploy na AWS.

---

## 1. Verificação de Identidade e Sessão AWS

Confirmou a conta e região ativa após o `aws login`:

```powershell
aws sts get-caller-identity
```

**Resultado:**
- Conta: `<account-id>`
- Região: `sa-east-1`
- ARN: `arn:aws:iam::<account-id>:user/<iam-user>` (ou equivalente via SSO)

---

## 2. Bootstrap do Estado Remoto (Terraform S3 State Bucket)

Criou o bucket S3 seguro para persistência do `terraform.tfstate`:

```powershell
cd infra/bootstrap
terraform init
terraform apply -var state_bucket_name=block-apps-terraform-state-<account-id> -auto-approve
```

**Recursos criados:**
- Bucket S3: `block-apps-terraform-state-<account-id>` (criptografado, privado, versionado)
- Regras de bloqueio de acesso público e política de expiração de versões antigas.

---

## 3. Empacotamento do Backend Lambda

Gerou o bundle esbuild em formato zip para inclusão no provisionamento Terraform:

```powershell
pnpm --filter @block-apps/backend package
```

**Artefato gerado:**
- `packages/backend/dist/lambda.zip` (~89.6 KB)

---

## 4. Deploy da Infraestrutura no Ambiente `dev`

Inicializou o backend S3 remoto, gerou o plano e aplicou na conta AWS:

```powershell
cd infra/environments/dev
terraform init -backend-config=backend.hcl
terraform plan -out=plan.tfplan
terraform apply plan.tfplan
```

**Resumo do Apply:**
- **54 recursos criados**, 0 alterados, 0 destruídos.
- **Outputs gerados:**
  - `api_url = "https://i51vicajy2.execute-api.sa-east-1.amazonaws.com"`
  - `user_pool_id = "sa-east-1_Xs9lFCHn5"`
  - `admin_web_client_id = "6r3dn6koip7gfpf4iu06ai3d47"`
  - `device_client_id = "4neoq0m9ihqped2jgv5lbnu4kn"`
  - `hosted_login_domain = "block-apps-auth-<account-id>.auth.sa-east-1.amazoncognito.com"`
  - `admin_site_url = "https://d3jj9d8zn6l37c.cloudfront.net"`
  - `admin_site_distribution_id = "E1114GSJE0ROG1"`
  - `admin_site_bucket_name = "block-apps-dev-admin-site-<account-id>"`

---

## 5. Validação de Saúde e Estado dos Recursos na AWS

Comandos de consulta e diagnóstico executados para checar integridade:

### API Gateway (Health Check via HTTP)
```powershell
Invoke-WebRequest -Uri "https://i51vicajy2.execute-api.sa-east-1.amazonaws.com/health" -UseBasicParsing
```
**Retorno:** `HTTP 200 OK` com payload `{"status":"ok"}`.

### Tabela DynamoDB
```powershell
aws dynamodb describe-table `
  --table-name block-apps-dev-data `
  --region sa-east-1 `
  --query "Table.[TableName,TableStatus,ItemCount]"
```
**Retorno:** `["block-apps-dev-data", "ACTIVE", 0]`

### Cognito User Pool e Primeiro Administrador
```powershell
aws cognito-idp list-users `
  --user-pool-id sa-east-1_Xs9lFCHn5 `
  --region sa-east-1 `
  --query "Users[*].[Username,UserStatus,Enabled]"
```
**Retorno:** Usuário inicial `<admin-email>` com status `FORCE_CHANGE_PASSWORD`, habilitado (`true`).

### Configuração da Função Lambda
```powershell
aws lambda get-function-configuration `
  --function-name block-apps-dev-api `
  --region sa-east-1 `
  --query "[FunctionName,Runtime,LastModified]"
```
**Retorno:** `["block-apps-dev-api", "nodejs24.x", "2026-11-12..."]`

---

## 6. Smoke Test Automatizado

Execução de teste end-to-end de fumaça contra a API e o Cognito reais:

```powershell
node packages/backend/scripts/smokeTest.mjs
```

**Verificações validadas:**
- Health check HTTP 200.
- Requisições não autenticadas rejeitadas com HTTP 401.
- Identificação da existência e estado do usuário inicial no Cognito.

---

## 7. Formatação e Validação Contínua do Terraform

Comandos de checagem estática da infraestrutura:

```powershell
terraform fmt -check -recursive infra/
terraform -chdir=infra/bootstrap init -backend=false
terraform -chdir=infra/bootstrap validate
terraform -chdir=infra/environments/dev init -backend=false
terraform -chdir=infra/environments/dev validate
```
