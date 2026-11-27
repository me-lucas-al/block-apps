# Convenções de código e pastas

Regras valem para TypeScript, Kotlin e Swift. As referências vêm da documentação oficial de cada linguagem.

## Pastas (todas as linguagens)

- No máximo cerca de **5 arquivos por pasta**. Passou disso, divida em subpastas **por tópico**, não por tipo genérico.
- Agrupe por domínio primeiro, depois por camada, depois por tópico (`ports/browser`, `ports/data`, `schedule/evaluation`, `schedule/editing`).
- Testes ficam numa subpasta `tests/` ao lado do código que cobrem.
- Teste de hook com estado (`renderHook`) no mobile usa o sufixo `.dom.test.ts` e roda sob `happy-dom` pelo glob `environmentMatchGlobs` de `apps/mobile/vitest.config.ts` (Vitest 2; no Vitest 3 ou mais novo, migrar para `test.projects`). Cada arquivo chama `afterEach(cleanup)`. Os demais testes rodam em `node`.
- Um arquivo, uma responsabilidade, até 100 linhas. Sem comentários: o nome explica.
- Sem duplicação entre apps: lógica comum vai para `packages/core` (regras) ou `packages/api` (acesso a dados e auth).

## Mapa do repositório

```
packages/
  core/src/          apps/{catalog,search/{matching,options}}/, cooldown/, ios/, keywords/{matching,search-engines}/, rules/change/, schedule/{evaluation,editing}/, sites/, users/
  api/src/           auth/{cognito,contracts,google,pkce,session,storage}/, config/, http/client/, polling/, repositories/{contracts,http/{admin-users,devices,pending-changes,rules}}/, subscription/
  api/tests/         testes do pacote (auth/, config/, helpers/, http/, integration/, polling/, repositories/)
  backend/src/       auth/, composition/{,doh/}, cooldown/{contracts,scheduling,use-cases}/, devices/, dns/, domain/{errors,rules,streams,time}/, http/, lambda/, local/, rules/{contracts,quota,use-cases}/, storage/, users/{contracts,guards,model,presentation,use-cases}/
    dns/             contracts/, errors/, profile/, resolver/, time-zone/, token/, upstream/, use-cases/
    http/            app/, auth/, doh/, errors/, parsing/{bodies,fields,users}/, responses/, routes/
    storage/         cognito/, dynamodb/{changes,conditions,devices,dns,keys,rules,settings,users}/
    lambda/          uma entrada por função (api, admin, dns, scheduler, preSignUp/)
    local/           servidor local e Cognito falso (nunca vai no zip da Lambda)
  backend/tests/     testes do pacote (admin/, api/, auth/, composition/, cooldown/, dns/, domain/, helpers/, lambda/, local/, rules/, storage/)
  backend/scripts/   empacota a Lambda (packageLambda.mjs) e o servidor local (buildLocal.mjs)
infra/
  bootstrap/         bucket S3 do estado remoto (aplicado uma vez)
  modules/           auth/, api/, data/, admin_site/, lambda_function/
  environments/dev/  main.tf, providers.tf, variables.tf, outputs.tf, versions.tf (e variáveis em arquivos separados)
apps/
  extension/manifest/  gera o manifest.json por navegador
  extension/src/     ports/{browser,data}/, adapters/{browser,chrome/{browser,identity,storage},firefox}/, shared/browser/, blocking/{,keywords/}, device/, popup/{components/{auth,rules,status},hooks,services}/, background/, blocked/
  admin/src/         ports/, adapters/, components/{layout,users}/, hooks/, screens/, services/, users/
  mobile/
    src/             ports/{appchoice,blocker,device,groupselection,protection,strictmode}/, adapters/{auth,secure-store,blocker/{android,ios}}/, strictmode/, rules/, errors/, sync/, services/, hooks/{device,rules,session}/, screens/{auth,home}/, components/{home,protection,rules,ui}/, device/, background/
    modules/app-blocker/
      src/                     ponte TypeScript
      android/.../appblocker/  Kotlin: admin/, service/, system/, ui/, rules/{model,evaluation,exceptions,ownership,storage}/
      ios/                     Swift: BlockingCore/ (pacote puro), Shared/, Authorization/, Schedule/, Picker/, UseCases/, Exceptions/, Module/
    targets/                 extensões iOS (device-activity-monitor, shield-config, shield-action)
    scripts/                 syncIosSharedSources.mjs (copia o Swift compartilhado para targets/_shared)
scripts/                     checkNoExplicitAny.mjs (pnpm check:no-any)
docker/                      Dockerfiles do painel (admin/) e da API local (local-api/)
docs/                        referência viva; history/ guarda registros do passado
```

Código nativo de cada plataforma fica dentro do módulo (`android/`, `ios/`). A UI é uma só, em React Native.

## Desvios conhecidos

O texto acima descreve a regra. O repositório ainda foge dela nestes pontos, registrados aqui em vez de reescrever a regra:

- **Testes de `packages/api` e `packages/backend`** ficam numa pasta `tests/` na raiz do pacote, não ao lado do código. Em Kotlin os testes seguem o padrão do Gradle (`android/src/test`) e em Swift o do SwiftPM (`BlockingCore/Tests`).
- **Pastas com mais de 8 arquivos**, no momento desta escrita: `packages/api/src/auth/cognito`, `packages/backend/src/composition`, `packages/backend/src/storage/cognito`, `packages/backend/src/local`, `apps/mobile/src/rules`, `apps/admin/src/screens`, `infra/modules/api` e `infra/modules/auth`. Nas pastas de testes: `packages/backend/tests/{helpers,api,storage}` e `packages/api/tests/auth`. Para conferir: `git ls-files | sed -E 's#/[^/]+$##' | sort | uniq -c | sort -rn | head`.
- **Arquivo acima de 100 linhas:** `packages/api/src/auth/cognito/CognitoAuthenticator.ts`, a fachada de login que delega aos colaboradores `Cognito*` da mesma pasta. Também passam de 100 linhas os testes `searchApps.test.ts` (core), `CognitoSessionManager.test.ts` (api) e `rules.test.ts` (backend).
- **Comentários:** `apps/mobile/index.ts` mantém os comentários do modelo do Expo.
- **`infra/environments/dev`** só tem o ambiente `dev`; produção é aplicada pelo `release.yml` no ambiente `production` do GitHub, com o mesmo diretório.

## Extensão: um código, dois navegadores

- `adapters/chrome/` guarda adaptadores que usam o namespace `chrome.*`. O Firefox expõe o mesmo namespace com Promises no Manifest V3, então esses adaptadores valem para Chrome, Edge e Firefox.
- `adapters/firefox/` só recebe o que é exclusivo do Firefox (ex.: `FirefoxIncognitoPort`). Se um comportamento de Chrome também for só de Chrome, ele fica em `adapters/chrome/` com prefixo `Chrome`.
- `adapters/browser/` guarda o que é neutro: fábricas que escolhem a porta pelo alvo (`createIncognitoPort`) e adaptadores sobre APIs comuns, com nome sem navegador (`ExtensionApiHostAccessPort`).
- `shared/browser/` guarda o tipo `BrowserTarget` e a leitura do alvo. O alvo é lido uma vez no ponto de entrada (`background/index.ts`, `popup/main.tsx`) e passado por parâmetro; nenhum componente ou use case lê variável de ambiente.
- `manifest/` (na raiz do app, fora de `src/`) monta o `manifest.json` de cada alvo. Não existe `manifest.json` estático.
- Diferenças de texto entre navegadores vêm da porta (`settingName`, `openSettingsLabel`), não de `if` na tela.

## TypeScript 6

- `tsconfig.base.json` usa `moduleResolution: bundler` e `verbatimModuleSyntax`. `strict`, `module` e `target` são os padrões do TS 6 e não precisam ser repetidos.
- `types` é `[]` por padrão no TS 6: liste explicitamente (`chrome`, `node`, `vite/client`) onde precisar.
- Importe tipos com `import type` ou `type` inline. Nunca `import * as React`; importe só o necessário (`import { useState } from 'react'`).
- Dependências por interface (portas e adaptadores), montadas no ponto de entrada (`composition.ts`, `createServices.ts`).

## Kotlin

- O diretório segue o pacote (`expo.modules.appblocker.rules.model` fica em `rules/model/`).
- Um arquivo por classe, com o nome da classe. Arquivo com várias declarações recebe nome que descreve o conteúdo. Evite nomes vazios como `Util`.
- Classes com regra de negócio ficam sem dependência de Android (`RuleEvaluator`), para testar com JUnit puro.

## Swift (módulo iOS)

- Siga as [API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines): nomes que formam frases naturais na chamada, fábricas começando com `make`, parâmetros que se leem bem na documentação.
- Mesma regra de pastas: `ios/` dividido por tópico (`Blocking/`, `Schedule/`, `Storage/`), um tipo principal por arquivo com o nome do tipo.
- **Tipo sempre explícito**: toda constante, variável e propriedade declara o tipo (`let weekday: Int = ...`), mesmo quando o Swift conseguiria inferir. Vale também para `guard let`, `if let`, `for` e parâmetros nomeados de closure. O SwiftLint barra o que faltar (`explicit_type_interface` em `apps/mobile/.swiftlint.yml`, job `ios-lint` do CI).
- Para rodar o lint na sua máquina, a partir de `apps/mobile`: `docker run --rm -v "$PWD:/work" -w /work ghcr.io/realm/swiftlint:0.65.1 lint --strict`.

## Fluxo de trabalho

- Uma branch por assunto, commits pequenos em inglês (Conventional Commits) e uma PR por branch.
- Antes de abrir PR: `pnpm test` e `pnpm typecheck` limpos.
