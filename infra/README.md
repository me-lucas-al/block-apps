# Infraestrutura (Terraform)

Toda a infraestrutura AWS do Block Apps: DynamoDB, Cognito, Lambdas, API Gateway, CloudFront e alarmes. Só o Terraform cria ou altera recursos; AWS CLI e console servem para autenticar e olhar.

## O que não faz

- Não cria o domínio nem o certificado do resolvedor DNS (`dns_host`): são feitos à parte ([docs/INFRA.md](../docs/INFRA.md)).
- Não empacota o código. O `lambda.zip` vem de `pnpm --filter @block-apps/backend package`, antes do `plan`.
- Não guarda segredos nem estado no git (`backend.hcl`, `terraform.tfvars`, planos e estado ficam de fora).

## Pastas

- `bootstrap/`: bucket S3 do estado remoto, aplicado uma vez com estado local.
- `modules/data/`: tabela DynamoDB e a role de leitura (`data-reader`).
- `modules/auth/`: Cognito (user pool, grupos, clients, Google, primeiro admin, gatilho PreSignUp).
- `modules/lambda_function/`: uma função Lambda com role, logs e tracing.
- `modules/api/`: as Lambdas `api`, `admin`, `dns` e `scheduler`, a HTTP API, as rotas, os alarmes e o agendamento de 5 minutos.
- `modules/admin_site/`: S3 privado e CloudFront para o painel administrativo.
- `environments/dev/`: junta os módulos. Rode os comandos de dentro dele.

`.tflint.hcl` e `.trivyignore.yaml` configuram o lint e o scanner de segurança do CI.

## Validar sem tocar na AWS

```powershell
cd infra/environments/dev
terraform init -backend=false
terraform validate
terraform fmt -recursive -check ..\..
```

Para planejar e aplicar, copie `backend.hcl.example` e `terraform.tfvars.example`, rode `terraform init -backend-config=backend.hcl`, `terraform plan -out plan.tfplan` e `terraform apply plan.tfplan`. Passo a passo, variáveis do GitHub e ordem segura de publicação em [docs/INFRA.md](../docs/INFRA.md). O CI roda `fmt`, `tflint`, `trivy` e `validate` (`.github/workflows/ci.yml`); o `plan` das PRs está em `terraform-plan.yml`.

## Documentação

- [Infraestrutura e Terraform](../docs/INFRA.md)
- [Backend: o que cada função faz](../docs/BACKEND.md)
- [Fluxo de uma rota até a Lambda](../README.md#por-onde-começar)
