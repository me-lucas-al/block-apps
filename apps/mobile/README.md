# App Android e iOS (`@block-apps/mobile`)

Aplicativo React Native (Expo) com uma interface só e código nativo por plataforma: Kotlin no Android e Swift no iOS. Entra com Cognito, sincroniza as regras do servidor e entrega ao módulo nativo, que bloqueia mesmo sem rede.

## O que não faz

- Não decide regra de bloqueio nem valida mudanças: usa `packages/core` e o backend.
- Não aplica palavras de busca (só a extensão) e não chama as rotas de DNS do iPhone ainda.
- O iOS está em validação, sem teste em aparelho ([docs/IOS.md](../../docs/IOS.md)).

## `src/`

- `ports/`: contratos neutros de plataforma (`blocker`, `protection`, `appchoice`, `groupselection`, `strictmode`, `device`).
- `adapters/`: implementações. `blocker/android/` e `blocker/ios/` falam com o módulo nativo; `auth/`, `secure-store/` e `createMobileServices.ts` montam sessão, Cognito e repositórios HTTP.
- `services/`: `createServices.ts` junta tudo e `ServicesContext` entrega às telas.
- `hooks/`: estado das telas (`session/`, `rules/`, `device/`).
- `components/` e `screens/`: interface (`screens/auth`, `screens/home`).
- `sync/` e `background/`: sincronização de regras, ao abrir o app e em tarefa de segundo plano.
- `rules/`, `strictmode/`, `errors/`, `device/`: montagem de regras, modo estrito do iOS, mensagens de erro e identidade do aparelho.

## `modules/app-blocker`

Módulo Expo com a mesma API nos dois sistemas.
- `src/`: a ponte TypeScript (`AppBlockerModule.ts`).
- `android/`: Kotlin. Serviço de acessibilidade, Device Admin e regras (`rules/`, sem dependência de Android nas classes de decisão).
- `ios/`: Swift. `BlockingCore/` é um pacote puro, testado em Linux; `Shared/` é compilado também nas extensões; `UseCases/`, `Picker/`, `Schedule/` e `Authorization/` ficam só no módulo.

## `targets/`

Extensões do iOS geradas por `@bacons/apple-targets`: `device-activity-monitor`, `shield-config` e `shield-action`. A pasta `_shared` é gerada por `pnpm sync:ios-shared` e não vai para o git.

## Comandos

```powershell
pnpm --filter @block-apps/mobile start
pnpm --filter @block-apps/mobile test
pnpm --filter @block-apps/mobile typecheck
pnpm --filter @block-apps/mobile android
pnpm --filter @block-apps/mobile ios
```

Copie `.env.example` para `.env` (`EXPO_PUBLIC_*`, do Terraform). Testes Kotlin: `pnpm exec expo prebuild --platform android --no-install` e depois `./gradlew :app-blocker:testDebugUnitTest` em `apps/mobile/android` (gerada pelo prebuild). Testes Swift: `swift test` em `modules/app-blocker/ios/BlockingCore`. Para regenerar o projeto iOS: `pnpm prebuild:ios`.

## Documentação

- [iOS (Screen Time API)](../../docs/IOS.md) e [pedido do entitlement](../../docs/IOS_ENTITLEMENT_REQUEST.md)
- [Convenções de código](../../docs/CONVENTIONS.md)
