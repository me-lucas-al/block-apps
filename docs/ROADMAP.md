# Roadmap

## Estado Atual do Projeto

| Componente | Estado | Descrição |
| --- | --- | --- |
| Regras, horários e palavras proibidas (`core`) | Pronto | Validação de janelas, palavras de busca proibidas, cooldown |
| Backend AWS (`backend`) | Pronto | API Hono em Lambda, use cases, DynamoDB single-table, Cognito |
| Infraestrutura como Código (`infra`) | Pronto | Módulos Terraform (auth, api, data, admin_site, lambda_function) |
| Cliente HTTP e Autenticação (`api`) | Pronto | `HttpApiClient`, `CognitoAuthenticator`, `SessionStorage`, `RulePoller` |
| Extensão Chrome/Edge (`extension`) | Pronto | MV3, blocking declarativo, busca protegida, Google PKCE, anti-anônimo |
| App Android (`mobile`) | Pronto | React Native + Kotlin native module, WorkManager, Device Admin |
| Painel Web Administrativo (`admin`) | Pronto | Vite/React, gerenciamento de usuários, MFA TOTP obrigatório, Google PKCE |
| CI/CD no GitHub Actions | Pronto | Typecheck, testes unitários, formatação e validação Terraform, release |
| Remoção de tecnologias legadas | Pronto | Supabase, Postgres e Edge Functions 100% removidos |
| App iOS (Screen Time API) | Em validação | Código pronto e compilado em CI; falta entitlement Family Controls e validação em aparelho (ver IOS.md) |
| Extensão Firefox | Planejado | Suporte a Gecko via webextension-polyfill |

## CI/CD no GitHub Actions

### CI (`.github/workflows/ci.yml`)
Roda em toda PR e em todo push para `main`:
- `check`: validação estrita sem `any` (`pnpm check:no-any`), `pnpm typecheck`, `pnpm test` (378 testes com DynamoDB local via Docker), build da extensão e build do painel administrativo.
- `android`: gera projeto nativo com `expo prebuild` e compila/testa o módulo Kotlin (`./gradlew :app-blocker:testDebugUnitTest`).
- `ios-core`: `swift test` do pacote `BlockingCore` num contêiner Swift em Linux.
- `terraform`: formatação estrita (`terraform fmt -check`), empacotamento Lambda e `terraform validate` de bootstrap e ambiente `dev`.

### Build iOS (`.github/workflows/ios-build.yml`)
Roda só em PRs que tocam o módulo iOS, as extensões ou a config do app: `expo prebuild`, `pod install` e `xcodebuild` para simulador, sem assinatura (macOS).

### Planejamento (`.github/workflows/terraform-plan.yml`)
Roda em PRs com alterações em `infra/**`, `packages/backend/**` ou `packages/core/**`:
- Autentica na AWS via GitHub OIDC (`AWS_ROLE_ARN`).
- Executa `terraform plan -no-color`; o plano fica no log do job. Sem o secret `AWS_ROLE_ARN` o plano é pulado com aviso.

### CD / Release (`.github/workflows/release.yml`)
Roda só por disparo manual (`workflow_dispatch`) a partir da branch `main`:
- Empacota Lambda backend (`packages/backend/dist/lambda.zip`) e extensão (`block-apps-extension.zip`).
- Aplica Terraform no ambiente `production`. A aprovação manual depende de configurar revisores nesse ambiente no GitHub; sem isso o apply roda direto.
- Compila o painel admin (`apps/admin/dist`), sincroniza com o bucket S3 privado e invalida cache no CloudFront.

## Próximos Passos (Futuro)

1. **Extensão Firefox**: empacotamento para Gecko com manifest v2/v3 híbrido.
2. **App iOS**: pedir o entitlement `family-controls`, validar em aparelho e, se passar, liberar o modo estrito (ver IOS.md).
3. **Limites de Regras**: implementação de cotas por plano/usuário no backend.
