# Roadmap

Para ver o que está aberto agora, use `gh issue list` e a lista de PRs do repositório. Este arquivo guarda o estado por componente e os próximos passos conhecidos.

## Estado Atual do Projeto

| Componente | Estado | Descrição |
| --- | --- | --- |
| Regras, horários e palavras proibidas (`core`) | Pronto | Validação de janelas, palavras de busca proibidas, cooldown, decisão de mudança que só aperta o bloqueio (`isTighteningChange`), alvos do iOS |
| Backend AWS (`backend`) | Pronto | API Hono em Lambda, use cases, DynamoDB single-table, Cognito, cota de regras por usuário, aperto de regra aplicado na hora, perfil de DNS e resolvedor DoH |
| Infraestrutura como Código (`infra`) | Pronto | Módulos Terraform (auth, api, data, admin_site, lambda_function), inclusive a Lambda `dns` com rotas abertas, alarmes e limite de taxa próprios |
| Cliente HTTP e Autenticação (`api`) | Pronto | `HttpApiClient`, `CognitoAuthenticator`, `SessionStorage`, `RulePoller`, saída da conta com revogação do refresh token |
| Extensão Chrome/Edge (`extension`) | Pronto | MV3, blocking declarativo, busca protegida, Google PKCE, anti-anônimo |
| App Android (`mobile`) | Pronto | React Native + módulo Kotlin, sincronização em segundo plano (`expo-background-task`), Device Admin |
| Painel Web Administrativo (`admin`) | Pronto | Vite/React, gerenciamento de usuários, MFA TOTP obrigatório, entrada por e-mail e senha |
| CI/CD no GitHub Actions | Pronto | Typecheck, testes unitários, formatação e validação Terraform, build iOS, release |
| App iOS (Screen Time API) | Em validação | Código pronto e compilado em CI; falta entitlement Family Controls e validação em aparelho (ver IOS.md) |
| Bloqueio de sites por DNS no iPhone | Só o servidor | Backend e Terraform prontos. Nenhum app chama `POST /dns/profile` ou baixa o `.mobileconfig` ainda; o domínio e o certificado do `dns_host` são criados à parte (ver BACKEND.md e INFRA.md) |
| Extensão Firefox | Implementado, falta publicar | `build:firefox` gera `dist-firefox` (Manifest V3 com `background.scripts` e ID Gecko fixo), sem polyfill. Falta testar em navegador real, informar `firefox_redirect_urls` no Terraform e enviar ao AMO (ver `apps/extension/README.md`) |

## CI/CD no GitHub Actions

### CI (`.github/workflows/ci.yml`)
Roda em toda PR e em todo push para `main`:
- `check`: validação estrita sem `any` (`pnpm check:no-any`), `pnpm typecheck`, `pnpm test` (com DynamoDB local como serviço do job), empacotamento da Lambda e build da extensão (Chrome e Firefox) e do painel administrativo.
- `android`: gera projeto nativo com `expo prebuild` e compila/testa o módulo Kotlin (`./gradlew :app-blocker:testDebugUnitTest`).
- `ios-core`: `swift test` do pacote `BlockingCore` num contêiner Swift em Linux.
- `ios-lint`: SwiftLint em modo estrito sobre o módulo iOS e as extensões; exige tipo explícito em toda declaração (`explicit_type_interface`).
- `terraform`: formatação estrita (`terraform fmt -check`), lint (`tflint` com plugin `aws`), scanner de segurança (`trivy config`), empacotamento Lambda e `terraform validate` de bootstrap e ambiente `dev`.

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
- Opcional, pela entrada `submit_ios`: compila o app iOS no EAS e envia ao TestFlight (ver IOS.md).

## Próximos Passos

1. **Cliente do bloqueio por DNS no iPhone**: o servidor já cria o token, entrega o perfil e resolve as consultas. Falta uma tela no app que chame `POST /dns/profile`, baixe `GET /dns/profile.mobileconfig` com o Bearer e entregue o arquivo ao iOS. Antes de usar de verdade também é preciso criar o domínio e o certificado do `dns_host` e definir as variáveis `DNS_HOST` e `DNS_UPSTREAM_URL` no GitHub (ver INFRA.md).
2. **App iOS**: pedir o entitlement `family-controls` (texto pronto em `IOS_ENTITLEMENT_REQUEST.md`) e validar em aparelho, incluindo o modo estrito, que já existe mas só deve ser usado num aparelho descartável até validar (ver IOS.md). Depois do teste em aparelho, decidir o corte de uma seleção acima do limite de 50 itens (issue de corte da seleção no iOS).
3. **Publicação da extensão Firefox**: carregar o zip no AMO, validar o login Google com a URL `extensions.allizom.org` e confirmar a declaração de dados coletados.
4. **Limites de Regras**: o backend limita as regras por usuário (`MAX_RULES_PER_USER`, padrão 200). Falta cota diferente por plano e um contador atômico para o limite ser rígido.
5. **Bloqueio nativo de buscas no Android**: o app já cadastra e lista palavras de busca (`targetType: keyword`), mas só a extensão as aplica. Aplicar no celular exige ligar `canRetrieveWindowContent` no serviço de acessibilidade, ler a barra de endereço de cada navegador suportado (ids de view variam por navegador e versão) e testar em aparelho. Como isso amplia a permissão do serviço (pode obrigar o usuário a reativá-lo) e entra na revisão de política da Play Store, fica como decisão do dono do projeto.
6. **Dados pessoais no histórico do git**: existe uma issue para reescrever o histórico. Só com autorização explícita do dono, porque exige force push em `main`.
