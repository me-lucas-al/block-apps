# Migração para a AWS

Backend migrado integralmente do Supabase para a AWS utilizando **Lambda + DynamoDB + Cognito + API Gateway**, provisionado exclusivamente via **Terraform**.

## Arquitetura

```
App Android / Extensão / Painel Admin
        │  login (Cognito SRP, Google OAuth + PKCE, MFA TOTP)  → JWT (ID / Access Token)
        ▼
API Gateway (HTTP API v2, Authorizer JWT nativo do Cognito)
        │
   ┌────┴─────────────────────────────┐
   ▼                                  ▼
Lambda API (rotas `/rules`, etc.)   Lambda Admin (rotas `/admin/*`)
   │                                  ├─ DynamoDB (dados e cooldown)
   ▼                                  └─ Cognito Identity Provider API
DynamoDB (tabela única)
```

## O que substitui o quê

| Recurso Legado (Supabase) | Arquitetura Atual (AWS) |
| --- | --- |
| Autenticação (e-mail/senha, Google) | Cognito User Pool, Hosted UI com PKCE para Google |
| Perfis e papéis (`profiles.role`) | Grupos nativos do Cognito: `admin` e `user` |
| Senha temporária (`must_change_password`) | Desafio nativo `NEW_PASSWORD_REQUIRED` / `FORCE_CHANGE_PASSWORD` |
| RLS (Row Level Security) | API Gateway JWT authorizer + use cases particionados por `USER#<sub_id>` |
| Funções SQL de cooldown | Use cases na Lambda acionados por rotas e EventBridge Scheduler a cada 5 min |
| Trava de último administrador | `LastAdminGuard` e checagem no Cognito Directory |
| Edge Function `admin-users` | Lambda `adminHandler` isolada com exigência de MFA TOTP ativo |
| Supabase Realtime | Polling resiliente via `RulePoller` na abertura, foreground e a cada N min |
| Hospedagem do Painel Web | CloudFront com OAC + S3 privado + cabeçalhos CSP estritos |
| Supabase local (Docker) | DynamoDB local + servidor HTTP Hono em desenvolvimento |

## Fases Concluídas

1. **Infraestrutura em Terraform (`feat/infra-auth-decisions`):** Tabela DynamoDB, User Pool Cognito, Lambdas (api, admin, scheduler, pre-signup), API Gateway, CloudFront S3 site, alarmes CloudWatch e AWS Budgets.
2. **Deploy em Dev:** Bucket de estado bootstrap, plano e apply do ambiente `dev`, criação do primeiro administrador e verificação de saúde.
3. **Cliente HTTP + Cognito (`packages/api`):** `HttpApiClient` com auto-refresh em 401, `CognitoAuthenticator` com SRP e PKCE, portas de repositórios HTTP e `RulePoller`.
4. **Migração dos Clientes:**
   - **Extensão (`apps/extension`):** MV3, storage local, Google OAuth com PKCE, blocking dinâmico e busca proibida.
   - **Mobile Android (`apps/mobile`):** `expo-secure-store`, Google AuthSession, módulo nativo Kotlin e tarefa em segundo plano (`expo-background-task`) que sincroniza as regras a cada 15 minutos, status de dispositivo com `adminActive`.
   - **Painel Admin (`apps/admin`):** Gestão de usuários, MFA TOTP obrigatório (entrada só por senha) e CSP no CloudFront/Nginx.
5. **Remoção do Supabase (`chore/remove-supabase`):** Eliminação completa de `supabase/`, pacotes legados e dependências `@supabase/supabase-js`.
6. **Pipelines CI/CD (`ci/terraform-and-release`):** Validação estrita no CI (`check:no-any`, `typecheck`, `test`), `terraform validate`, `terraform plan` em PRs e deploy automatizado no push para `main`.
