# Roadmap

## Estado

| Parte | Estado |
| --- | --- |
| Regras e horários (`core`) | pronto |
| Banco, RLS e cooldown (`supabase/`, `database`) | pronto, testado em Postgres em memória |
| Extensão Chrome/Edge | pronto, falta teste manual no navegador |
| App Android (RN + Kotlin) | pronto, Kotlin ainda sem compilar fora do CI |
| Sugestões e bloqueio de app não instalado | pronto |
| CI no GitHub Actions | em andamento |
| App iOS (Screen Time API) | pausado, ver abaixo |
| Extensão Firefox | planejado |
| Sync em background no Android (WorkManager) | planejado |
| Bloquear telas de configuração do Android | planejado |
| API própria na AWS (AWS Blocks) | spike pendente |

## CI/CD no GitHub Actions

### CI (`.github/workflows/ci.yml`)

Roda em toda PR e em todo push para `main`:

- `check`: `pnpm install --frozen-lockfile`, `typecheck`, `test` (inclui o banco em PGlite) e build da extensão.
- `android`: gera o projeto nativo com `expo prebuild` e roda `./gradlew :app-blocker:testDebugUnitTest`. É o único lugar onde o Kotlin é compilado e testado de verdade.

### CD: o que "cair em produção" significa aqui

Produção = `main` com CI verde e aprovação no ambiente `production` do GitHub (revisor obrigatório). Cada alvo tem o próprio workflow:

| Alvo | Gatilho | Precisa de |
| --- | --- | --- |
| Banco (Supabase) | push em `main` que altera `supabase/migrations/**` | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` e `SUPABASE_PROJECT_REF` (secrets/variáveis do ambiente) |
| Extensão | build do `.zip` em todo push; publicação na Chrome Web Store em tag `extension-v*` | credenciais da API da Chrome Web Store. A loja revisa a versão, então não é imediato |
| App Android | tag `mobile-v*`, com EAS Build e Submit para a faixa de teste interno | `EXPO_TOKEN` e conta de serviço do Play Console. A primeira publicação é manual |
| API na AWS (futuro) | push em `main` com `cdk deploy` | role AWS via OIDC, sem chaves de longa duração |

Regras: nenhum segredo no repositório; migrations só avançam (sem rollback automático); deploy de produção só depois do CI verde e da aprovação do ambiente.

Os workflows de CD ainda não existem porque dependem de contas e segredos que não foram criados (projeto Supabase, Chrome Web Store, Play Console). Eles entram assim que cada alvo estiver configurado.

## iOS

Pausado até confirmar Mac e conta Apple Developer (o entitlement `com.apple.developer.family-controls` é concedido pela Apple). Pontos de design já conhecidos:

- A Apple só entrega tokens opacos pelo seletor do Screen Time, e só de apps instalados. Não dá para bloquear app não instalado.
- Aplicar horários sem o app aberto exige uma extensão `DeviceActivityMonitor`, que é um target separado do app.
