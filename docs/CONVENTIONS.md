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
  core/src/        rules/, schedule/{evaluation,editing}/, cooldown/, apps/{catalog,search}/, sites/
  api/src/         auth/, repositories/{contracts,supabase}/
  database/src/    harness/ (Postgres em memória), tests/ (RLS e cooldown)
supabase/
  migrations/      schema, RLS e funções (única fonte de verdade do banco)
apps/
  extension/src/   ports/{browser,data}/, adapters/{chrome,supabase}/, blocking/, device/, popup/, background/
  mobile/
    src/           ports/, sync/, hooks/, screens/, components/
    modules/app-blocker/
      src/                   ponte TypeScript
      android/.../appblocker/  Kotlin: admin/, service/, system/, ui/, rules/{model,evaluation,storage}/
      ios/                   Swift (fase iOS)
```

Código nativo de cada plataforma fica dentro do módulo (`android/`, `ios/`). A UI é uma só, em React Native.

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
