# Migração para a AWS

Decisão: o backend sai do Supabase e vai para a AWS, com **Lambda + DynamoDB + Cognito + API Gateway**, tudo criado por **Terraform** (nunca por AWS CLI ou console).

## Arquitetura

```
App Android / Extensão / Painel admin
        │  login (Cognito, SRP ou Google)  → JWT
        ▼
API Gateway (HTTP API, authorizer JWT do Cognito)
        ▼
Lambda "lambdalith" (Node 24, arm64, Hono)
   ├─ use cases pequenos (regras, mudanças pendentes, dispositivos, usuários)
   ├─ DynamoDB (tabela única)
   └─ Cognito (API de administração, só da Lambda)
```

## O que substitui o quê

| Supabase | AWS |
| --- | --- |
| Auth (e-mail e senha, Google) | Cognito user pool, login hospedado para o Google |
| `profiles.role` | grupos do Cognito: `admin` e `user` |
| Senha temporária (`must_change_password`) | estado nativo `FORCE_CHANGE_PASSWORD` do Cognito |
| RLS | a API é o único caminho: o token define o `userId`, e cada use case só lê e escreve a partição `USER#<id>` |
| Funções SQL do cooldown | use cases `RequestRuleRemoval`, `ApplyDueRuleChanges` etc. na Lambda |
| Trigger do último administrador | checagem condicional no DynamoDB (item guardião) |
| Edge Function `admin-users` | rotas `/admin/users` na Lambda, usando a API de administração do Cognito |
| Realtime | sync periódico e ao abrir (sem WebSocket) |
| Supabase local (Docker) | DynamoDB local (1 container) para testes de integração |

## Modelo de dados (tabela única `block-apps-<env>-data`)

| Item | `pk` | `sk` |
| --- | --- | --- |
| Regra de bloqueio | `USER#<id>` | `RULE#<app ou site>#<alvo>` |
| Mudança pendente | `USER#<id>` | `CHANGE#<ruleId>` (com `dueBucket` e `effectiveAt`) |
| Dispositivo | `USER#<id>` | `DEVICE#<deviceId>` |
| Configuração do usuário (cooldown) | `USER#<id>` | `SETTINGS` |

O índice `due-changes` (`dueBucket`, `effectiveAt`) permite achar mudanças vencidas de todos os usuários sem varrer a tabela.

## Fases (uma PR por fase)

1. **Infra em Terraform** (esta PR): tabela, Cognito, Lambda e API Gateway. Valida offline; aplicar exige credenciais e a sua confirmação.
2. **Backend**: pacote `packages/backend` com Hono, use cases e adaptadores DynamoDB, testado contra DynamoDB local.
3. **Usuários e administradores**: rotas administrativas sobre o Cognito, com as mesmas salvaguardas de hoje (não excluir a si mesmo, manter um administrador, promoção exige nova senha).
4. **Clientes**: `packages/api` vira cliente HTTP + Cognito; app, extensão e painel trocam os adaptadores do Supabase.
5. **Remoção do Supabase**: `supabase/`, `packages/database`, `packages/edge-functions-tests`, `packages/e2e-local`, Docker do Supabase.
6. **CI/CD**: `terraform plan` em PR e `apply` com aprovação, usando OIDC (sem chaves de longa duração).

## Riscos e decisões em aberto

- Sem Realtime: mudanças de regra chegam no próximo sync.
- Cognito cobra por usuário ativo acima do free tier; para este projeto fica dentro do gratuito por muito tempo.
- O estado do Terraform guarda segredos (senha temporária, segredo do Google): bucket versionado, criptografado e privado (`infra/bootstrap`).
- O framework AWS Blocks gera CDK, então não foi usado: a regra do projeto é Terraform.
