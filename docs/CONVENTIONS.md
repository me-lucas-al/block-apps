# Convenções de código e pastas

Regras valem para TypeScript, Kotlin e Swift. As referências vêm da documentação oficial de cada linguagem.

## Pastas (todas as linguagens)

- No máximo cerca de **5 arquivos por pasta**. Passou disso, divida em subpastas **por tópico**, não por tipo genérico.
- Agrupe por domínio primeiro, depois por camada, depois por tópico (`ports/browser`, `ports/data`, `schedule/evaluation`, `schedule/editing`).
- Testes ficam numa subpasta `tests/` ao lado do código que cobrem.
- Um arquivo, uma responsabilidade, até 100 linhas. Sem comentários: o nome explica.
- Sem duplicação entre apps: lógica comum vai para `packages/core` (regras) ou `packages/api` (acesso a dados e auth).

## Mapa do repositório

```
packages/
  core/src/        rules/, schedule/{evaluation,editing}/, cooldown/, apps/{catalog,search}/, sites/, keywords/{matching,search-engines}/, users/
  api/src/         auth/{cognito,session,storage}/, repositories/{contracts,http}/, http/client/, polling/
  backend/src/     http/{app,routes,auth,errors}/, storage/{dynamodb,cognito}/, cooldown/, users/, devices/
infra/
  modules/         auth/, api/, data/, admin_site/, lambda_function/
  environments/dev/ main.tf, variables.tf, outputs.tf
apps/
  extension/        manifest/ (gera o manifest.json por navegador)
  extension/src/   ports/{browser,data}/, adapters/{browser,chrome,firefox}/, shared/browser/, blocking/{,keywords/}, device/, popup/, background/
  admin/src/       ports/, adapters/, components/, screens/, services/, users/
  mobile/
    src/           ports/, adapters/, sync/, background/, hooks/, screens/, components/, device/
    modules/app-blocker/
      src/                   ponte TypeScript
      android/.../appblocker/  Kotlin: admin/, service/, system/, ui/, rules/{model,evaluation,storage}/
      ios/                   Swift (fase iOS pausada)
```

Código nativo de cada plataforma fica dentro do módulo (`android/`, `ios/`). A UI é uma só, em React Native.

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

## Fluxo de trabalho

- Uma branch por assunto, commits pequenos em inglês (Conventional Commits) e uma PR por branch.
- Antes de abrir PR: `pnpm test` e `pnpm typecheck` limpos.
