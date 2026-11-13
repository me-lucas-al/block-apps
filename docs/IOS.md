# iOS (Screen Time API)

Estado: código escrito e testado onde dá (lógica em CI Linux, compilação em CI macOS). **Nada foi visto funcionando num aparelho**: falta o entitlement `family-controls` aprovado pela Apple e a validação da Etapa 6 abaixo.

## Como o iOS difere do Android

- Apps são escolhidos no seletor da Apple (`FamilyActivityPicker`) e chegam como **tokens opacos**: o app não sabe nome nem bundle id, e os tokens valem só naquele aparelho. Por isso a regra de app do Android (pacote) não serve no iOS.
- Sites bloqueiam por domínio em texto (`webContent.blockedByFilter`), então as regras `site` do servidor valem no iOS (limite de cerca de 50 domínios).
- Palavras de busca não existem no iOS.
- `DeviceActivity` aceita cerca de 20 atividades, com intervalo mínimo de 15 minutos, e `intervalDidEnd` nem sempre dispara.
- O usuário pode revogar a autorização em Ajustes, e os bloqueios caem na hora.

## Tipos de regra

| Tipo | Alvo | Onde vale |
| --- | --- | --- |
| `iosSelection` | nome do grupo (slug, até 50 caracteres) | iOS. O servidor guarda nome, modo e janelas e aplica o cooldown; os tokens ficam só no aparelho, ligados ao id da regra. |
| `protection` | `ios-deny-app-removal` | iOS, reservado para o modo estrito (Etapa 7, ainda não ligado na tela). |

Em outro iPhone ou depois de reinstalar, a regra volta do servidor e o app pede para escolher os apps de novo. Android e extensão ignoram os tipos novos.

## Estrutura

```
apps/mobile/
  modules/app-blocker/ios/
    BlockingCore/        pacote Swift puro (Foundation), testado com `swift test` em Linux
    Shared/              Storage/, Blocking/, Selection/, Messages/ (compilado no módulo e nas extensões)
    Authorization/ Schedule/ Picker/ UseCases/   só no módulo
    AppBlockerModule.swift   API para o JavaScript
  targets/               extensões geradas por @bacons/apple-targets
    device-activity-monitor/  shield-config/  shield-action/
    _shared/             gerado por `pnpm sync:ios-shared`, fora do git
  src/adapters/blocker/{android,ios}/   adaptadores das portas neutras
```

`pnpm sync:ios-shared` copia `BlockingCore/Sources` e `Shared` para `targets/_shared`, para as extensões compilarem o mesmo código do módulo. O script roda antes de `expo run:ios`, no hook `eas-build-pre-install` do EAS e no CI.

## Como bloqueia (falha fechado)

- O padrão é bloqueado. `ShieldApplier` recalcula tudo a partir das regras salvas e da hora atual e grava no `ManagedSettingsStore`.
- `ShieldSchedulePlanner` transforma as janelas em atividades de `DeviceActivity`: uma em cada borda (início e fim de cada janela, cortada na meia-noite), sem repetir, com 15 minutos de intervalo. Cada callback só recalcula.
- Regras que estourariam o limite de 20 atividades ficam sempre bloqueadas, e a tela avisa.
- O recálculo também roda ao voltar ao primeiro plano e numa tarefa em segundo plano (`expo-background-task`, melhor esforço).
- `requireAutomaticDateAndTime` fica ligado enquanto houver regra com horário, para o relógio não ser adiantado.
- A extensão de ação só fecha a tela de bloqueio, nunca libera.

## Encolher a seleção é afrouxar

Adicionar apps vale na hora. Remover apps fica guardado como seleção pendente e o app cria um pedido de alteração (`POST /rules/:ruleId/update-requests`) para o servidor aplicar o cooldown. Só depois de o pedido ser criado com sucesso a seleção pendente recebe uma marca com o horário em que o cooldown termina. A seleção guardada vira a ativa apenas quando o pedido deixou de estar pendente **e** esse horário já passou. Se o pedido some antes (cancelado em outro aparelho), a seleção guardada é descartada e os apps atuais seguem bloqueados. Seleção pendente sem a marca nunca é efetivada. Se o pedido falhar (por exemplo, sem rede), o app descarta a seleção pendente e avisa.

## Segurança

- Se as regras não puderem ser lidas do App Group, o bloqueio atual é mantido (não limpa nada). O registro das atividades só é refeito quando o plano muda.
- Autorização conferida a cada volta ao primeiro plano e reportada ao servidor (`PUT /devices/:id/status`, `platform: ios`, `adminActive` igual à autorização ativa).
- Sair da conta não desbloqueia. Tokens do Cognito ficam no Keychain (`expo-secure-store`).
- Nenhum dado de uso sai do aparelho. Há manifesto de privacidade em `app.json`.

## Pré-requisitos (feitos por você)

1. Assinar o Apple Developer Program (US$ 99 por ano) e criar a conta Expo/EAS.
2. Pedir à Apple o entitlement de distribuição `com.apple.developer.family-controls` para os quatro identificadores: `com.blockapps.mobile`, `.monitor`, `.shieldconfig` e `.shieldaction`. Pedir no primeiro dia: a aprovação leva semanas e é o caminho crítico.
3. Criar o App Group `group.com.blockapps.mobile`.
4. Definir `APPLE_TEAM_ID` como variável de ambiente do EAS (`eas env:create`, ambiente `production`): o build remoto reavalia `app.config.js` no servidor e não herda variáveis do GitHub Actions. Sem ele o plugin avisa e a assinatura falha.
5. Para o envio ao TestFlight, preencher `submit.production.ios.ascAppId` em `apps/mobile/eas.json` (ou configurar a chave da App Store Connect no EAS).

## Builds

- CI (`ios-build.yml`, só em PRs que tocam o iOS): `expo prebuild`, `pod install` e `xcodebuild` para simulador sem assinatura. Só compila.
- Aparelho: `eas build --platform ios --profile production`. O `release.yml` tem o job opcional `submit-ios` (entrada `submit_ios`, ambiente `production`) que compila e envia ao TestFlight; precisa do segredo `EXPO_TOKEN`.

## Validação em aparelho (Etapa 6)

Fazer num iPhone com iOS 16 ou mais, depois da aprovação da Apple. Correções vão em `fix/ios-device-findings`.

- Autorizar e criar um grupo de apps; ver o bloqueio.
- Regra com janela: libera no início, rebloqueia no fim, inclusive cruzando a meia-noite.
- Bloquear site no Safari e no Chrome.
- Modo avião: continua bloqueando.
- Sair da conta: continua bloqueando.
- Revogar em Ajustes: o app avisa e o servidor recebe o status.
- Mudar o relógio: impedido.
- Remover apps do grupo: só vale depois do cooldown.
- Reinstalar e entrar de novo: as regras voltam e a seleção pede nova escolha.
- Confiabilidade dos callbacks de `DeviceActivity` e dos tokens depois de atualizar o iOS.

## Modo estrito (Etapa 7, só se a validação passar)

`denyAppRemoval` como regra `protection`, desligado por padrão, com aviso de que impede remover todos os apps e de que há relatos de ficar preso (a saída é restaurar o iPhone). Testar por último e só no aparelho de teste.

## Riscos

- O Swift do módulo e das extensões nunca foi executado: erros de runtime só aparecem na validação em aparelho. O CI macOS só garante que compila.
- `@bacons/apple-targets` não foi testado pelo autor em todos os tipos de extensão, e a assinatura de extensões com `family-controls` no EAS tem falhas relatadas.
- Minutos de macOS no GitHub Actions custam mais; o job fica restrito a PRs que tocam o iOS.
- A App Review pode questionar o uso; por isso o app não esconde apps por bundle id.

## Fora do escopo

- Palavras de busca no iOS e modo "filho" (controle parental).
- O `RulesSyncWorker` do Android só relê o que está salvo; sincronização real só com o app aberto. Vale uma PR separada.
