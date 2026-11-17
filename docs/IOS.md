# iOS (Screen Time API)

Estado: código escrito e testado onde dá (lógica em CI Linux, compilação em CI macOS). **Nada foi visto funcionando num aparelho**: falta o entitlement `family-controls` aprovado pela Apple e a validação da Etapa 6 abaixo.

## Como o iOS difere do Android

- Apps são escolhidos no seletor da Apple (`FamilyActivityPicker`) e chegam como **tokens opacos**: o app não sabe nome nem bundle id, e os tokens valem só naquele aparelho. Por isso a regra de app do Android (pacote) não serve no iOS.
- Sites bloqueiam por domínio em texto (`webContent.blockedByFilter`), então as regras `site` do servidor valem no iOS (limite de cerca de 50 domínios, **relato não confirmado em doc oficial**).
- Palavras de busca não existem no iOS.
- `DeviceActivity` aceita cerca de 20 atividades, com intervalo mínimo de 15 minutos, e `intervalDidEnd` nem sempre dispara. Esses limites (20 atividades, 15 minutos) e os de 50 apps e 50 domínios vêm de relatos de desenvolvedores; **não estão confirmados em documentação oficial da Apple** e precisam ser vistos em aparelho.
- O usuário pode revogar a autorização em Ajustes, e os bloqueios caem na hora.

## Tipos de regra

| Tipo | Alvo | Onde vale |
| --- | --- | --- |
| `iosSelection` | nome do grupo (slug, até 50 caracteres) | iOS. O servidor guarda nome, modo e janelas e aplica o cooldown; os tokens ficam só no aparelho, ligados ao id da regra. |
| `protection` | `ios-deny-app-removal` | iOS, só modo `always`. É o modo estrito: enquanto a regra existir, o iPhone não deixa remover apps. Desligar é remover a regra, então passa pelo cooldown do servidor. |

Em outro iPhone ou depois de reinstalar, a regra volta do servidor e o app pede para escolher os apps de novo. Android e extensão ignoram os tipos novos.

## Estrutura

```
apps/mobile/
  modules/app-blocker/ios/
    BlockingCore/        pacote Swift puro (Foundation), testado com `swift test` em Linux
    Shared/              Storage/, Blocking/, Selection/, Messages/ (compilado no módulo e nas extensões)
    Authorization/ Schedule/ Picker/ UseCases/ Exceptions/ Module/   só no módulo
    AppBlockerModule.swift   API para o JavaScript
  targets/               extensões geradas por @bacons/apple-targets
    device-activity-monitor/  shield-config/  shield-action/
    _shared/             gerado por `pnpm sync:ios-shared`, fora do git
  src/adapters/blocker/{android,ios}/   adaptadores das portas neutras
```

`pnpm sync:ios-shared` copia `BlockingCore/Sources` e `Shared` para `targets/_shared`, para as extensões compilarem o mesmo código do módulo. O script roda antes de `expo run:ios`, no hook `eas-build-pre-install` do EAS e no CI.

## Como bloqueia (falha fechado)

- O padrão é bloqueado. `ShieldApplier` recalcula tudo a partir das regras salvas e da hora atual e grava no `ManagedSettingsStore`.
- `ShieldSchedulePlanner` transforma as janelas em atividades de `DeviceActivity` que **repetem todo dia**: uma por minuto de borda distinto (início e fim de cada janela), sem repetir, com 15 minutos de intervalo. O dia da semana não entra, então horários iguais em dias diferentes gastam uma só atividade. Cada callback só recalcula.
- Regras que estourariam o limite de 20 atividades ficam sempre bloqueadas, e a tela avisa.
- Se algum `startMonitoring` falha, o registrador marca o agendamento como incompleto no App Group e toda regra com horário fica bloqueada até um novo registro dar certo. `InstallRulesUseCase` aplica os bloqueios mesmo quando o registro falha. O registro é refeito quando o plano muda ou quando o sistema deixou de monitorar alguma atividade (`DeviceActivityCenter.activities`).
- O recálculo também roda ao voltar ao primeiro plano e numa tarefa em segundo plano (`expo-background-task`, melhor esforço).
- `requireAutomaticDateAndTime` fica ligado com regra de horário ou modo estrito aceito (`AutomaticClockPolicy`), para o relógio não ser adiantado.
- A extensão de ação só fecha a tela de bloqueio, nunca libera.

## Encolher a seleção é afrouxar

Adicionar apps vale na hora. Remover apps fica guardado como seleção pendente e o app cria um pedido de alteração (`POST /rules/:ruleId/update-requests`) para o servidor aplicar o cooldown. Só depois de o pedido ser criado com sucesso a seleção pendente recebe uma marca com o horário em que o cooldown termina. A decisão é do módulo nativo, em `setRules`, depois da checagem de dono (`HeldRemovalPolicy`): o app manda os ids com pedido pendente e a hora do servidor (cabeçalho `Date` da última resposta). A seleção guardada vira a ativa apenas quando o pedido deixou de estar pendente **e** a hora do servidor passou desse horário; sem hora do servidor nada é efetivado. Se o pedido some antes (cancelado em outro aparelho), a seleção guardada é descartada e os apps atuais seguem bloqueados. Seleção pendente sem a marca nunca é efetivada. Se o pedido falhar (por exemplo, sem rede), o app descarta a seleção pendente e avisa. Se já existe uma alteração de horário pendente com conteúdo diferente da regra atual, o app recusa o pedido de remoção em vez de cancelá-la.

## Segurança

- Se as regras não puderem ser lidas do App Group, o bloqueio atual é mantido (não limpa nada). O registro das atividades só é refeito quando o plano muda.
- A autorização do Tempo de Uso é pedida na primeira abertura, com o app logado, enquanto o status for "não determinado" (o botão "Autorizar" continua no cartão de proteção).
- O módulo expõe `setRules`, `reapplyShields` e `recordAppOpened` como `AsyncFunction`, e `getGroupStates` devolve numa só chamada a seleção e o agendamento de todos os grupos. O `expo-module.config.json` usa a plataforma `apple` (conferido com `expo-modules-autolinking resolve --platform apple`).
- Autorização conferida a cada volta ao primeiro plano e reportada ao servidor (`PUT /devices/:id/status`, `platform: ios`, `adminActive` igual à autorização ativa).
- Sair da conta não desbloqueia, e **entrar com outra conta não substitui as regras** enquanto houver regras em vigor: o app grava no App Group o dono das regras (o `sub` do Cognito, que não muda com o e-mail) e o módulo recusa `setRules`, o seletor de apps (resultado `notOwner`) e o pedido de remoção de outra conta (`RulesOwnershipPolicy`). Quando o dono fica sem regras (por exemplo, removeu tudo depois do cooldown), outra conta pode assumir. Hoje isso vale só no iOS; o Android ainda aceita a troca.
- Tokens do Cognito ficam no Keychain (`expo-secure-store`).
- Pedir de novo a remoção de apps do mesmo grupo cancela o pedido anterior e **recomeça o cooldown**; sem isso o novo pedido herdava o prazo do antigo e dava para encurtar a espera. Enquanto o grupo inteiro espera para ser removido, "Editar apps" fica bloqueado.
- Se as regras no App Group não existem ou não podem ser lidas, o bloqueio atual é mantido (nunca limpa por engano).
- Nenhum dado de uso sai do aparelho. Há manifesto de privacidade em `app.json`.

## Pré-requisitos (feitos por você)

O texto do pedido do entitlement está em [`IOS_ENTITLEMENT_REQUEST.md`](IOS_ENTITLEMENT_REQUEST.md).

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
- Remover apps do grupo: só vale depois do cooldown, com a hora do servidor (mudar o relógio do aparelho não adianta).
- Trocar de conta com regras em vigor: o seletor de apps e o pedido de remoção são recusados.
- Modo estrito (num aparelho que você possa restaurar): ligar, tentar remover um app (deve ser impedido), pedir para desligar e conferir que só libera depois do cooldown, cancelar o pedido, e desinstalar o Block Apps com o modo desligado para confirmar que a trava não fica presa.
- Atividade diária que cruza a meia-noite (início 23:50, fim 00:05 sem dia da semana): confirmar que dispara nos dois pontos.
- Entrar com outra conta com regras ativas é recusado, e voltar à conta original funciona.
- Modo estrito: depois de aceitar num build com a flag, instalar um build sem ela e abrir o app: a trava deve cair.
- Modo estrito: sem autorização do Tempo de Uso o app não deixa ligar; a atividade `strict-mode-heartbeat` dispara todo dia e a trava libera depois de 14 dias sem abrir o app, mesmo sem outra regra de horário; em um segundo aparelho, o aceite é pedido antes de a trava ligar.
- Reinstalar e entrar de novo: as regras voltam e a seleção pede nova escolha.
- Ver no Console.app os logs do módulo e conferir que as falhas chegam ao app com os códigos de `ERR_*` (por exemplo, abrir o seletor sem tela disponível).
- Grupo com mais de 50 apps: ver se o iOS bloqueia todos ou só parte, e se a lista mostra o aviso.
- Confiabilidade dos callbacks de `DeviceActivity` e dos tokens depois de atualizar o iOS.

## Erros e logs

- O módulo e as extensões registram falhas com `os.Logger` (subsistema `com.blockapps.mobile`, categorias `storage`, `schedule`, `selection`, `authorization`); dá para ver no Console.app com o aparelho conectado.
- App Group ausente, seleção que não grava, regras ilegíveis, falha de agendamento, outra conta e seletor que não abriu viram exceções com código (`ERR_APP_GROUP_UNAVAILABLE`, `ERR_SELECTION_NOT_SAVED`, `ERR_INVALID_RULES`, `ERR_SCHEDULE_REGISTRATION_FAILED`, `ERR_ANOTHER_ACCOUNT_OWNS_RULES`, `ERR_PICKER_NOT_PRESENTED`). O app traduz o código em `describeAppFailure`. Os códigos são definidos explicitamente nas classes de `Exceptions/`; não confirmado em aparelho que o Expo os entrega com esse valor.
- Uma seleção guardada que não pode ser lida aparece na lista do grupo como "não pôde ser lida" (`getGroupStates`, campo `unreadableRuleIds`), diferente de "ainda não escolhida".
- Falha da sincronização aparece como aviso no topo da tela inicial; falha ao pedir a autorização do Tempo de Uso aparece no cartão de proteção.

## Modo estrito (`denyAppRemoval`)

Opcional e **escondido por padrão**: o cartão "Modo estrito" só aparece em builds com `EXPO_PUBLIC_STRICT_MODE_ENABLED=true` (lida em `readMobileConfig`). Sem a flag não há cartão, logo não há aceite e o nativo nunca liga a trava. A flag só deve ser ligada depois da validação em aparelho. Se um build sem a flag for instalado depois de um com ela, o app apaga o aceite deste aparelho na abertura (`revokeStrictMode`) e a trava `denyAppRemoval` cai.

- **Ligar** pede confirmação com o aviso de que o iPhone passa a não deixar remover **nenhum** app, de que há relatos de a trava continuar depois de o Block Apps ser desinstalado (a saída seria restaurar o iPhone) e de que desligar espera o cooldown. Ligar cria a regra `protection` / `ios-deny-app-removal` (modo `always`) no servidor e grava o **aceite deste aparelho** no App Group; apertar é imediato.
- **Desligar** é um pedido de remoção dessa regra: só vale quando o cooldown da conta termina, e dá para cancelar o pedido antes disso.
- A regra é da conta, mas a trava só liga num aparelho depois do aceite **naquele** iPhone: em outro aparelho (ou depois de reinstalar) o cartão mostra "Confirmar neste aparelho" com o mesmo aviso.
- No aparelho, `ShieldApplier` liga `store.application.denyAppRemoval` quando existe uma regra `protection` sempre ligada com esse alvo **e** o aceite deste aparelho (`StrictModePolicy`, testada em Linux), e desliga quando a regra some. Regra com horário ou outro alvo é ignorada.

**Para não ficar preso:** só dá para ligar com a autorização do Tempo de Uso ativa; o planejador mantém uma atividade diária `strict-mode-heartbeat` (reserva 1 das 20 vagas) enquanto a regra existir, para a extensão reavaliar a trava todo dia mesmo sem outras regras de horário; e a trava se desliga sozinha se o Block Apps ficar mais de 14 dias sem ser aberto (cada vez que o app volta ao primeiro plano registra a data no App Group; a sincronização em segundo plano não conta), por exemplo se um build de teste do TestFlight expirar. O servidor só aceita a regra `protection` no modo sempre ligado, na criação e em atualizações.

**Não confirmado em doc oficial:** se `denyAppRemoval` funciona com a autorização `.individual`. Teste em aparelho descartável **antes** de usar no seu iPhone de uso diário.

## Limites conhecidos

- **Relógio:** a remoção de apps usa a hora do servidor, não a do aparelho. `requireAutomaticDateAndTime` fica ligado com regra de horário **ou** modo estrito ativo (`AutomaticClockPolicy`).
- **Reinstalar:** a regra volta do servidor sem a seleção de apps, que fica só no aparelho, e o grupo fica sem bloqueio até escolher os apps de novo (o app avisa). A primeira escolha depois de reinstalar não passa pelo cooldown.
- **Apps por grupo:** relata-se que a Apple só protege cerca de 50 apps por seleção (não confirmado). O limite relatado vale para o total bloqueado, mas a lista avisa por grupo (dois grupos de 30 apps não avisam), quando um grupo passa de 50 apps escolhidos individualmente (`SelectionLimits`; categorias não entram na conta), mas o módulo não corta a seleção: o corte automático fica para depois do teste em aparelho.
- **Domínios:** `blockedByFilter` aceita cerca de 50 domínios (relato não confirmado); o excedente não é tratado nem avisado, e a lista de grupos do iOS não mostra regras de site.
- **Seleção órfã:** a seleção guardada de uma regra removida ou de um formulário cancelado não é apagada (não há função nativa para isso); se a regra for recriada com o mesmo nome, herda a seleção antiga.
- **Corrida na atualização:** uma atualização da lista logo depois de pedir a remoção pode descartar o pedido guardado; o efeito é seguro (os apps continuam bloqueados) mas o pedido precisa ser refeito.
- **`_shared`:** conferido no código do `@bacons/apple-targets` 5.0.0 (`with-xcode-changes.js`): o grupo `targets/_shared` entra nas extensões **e também no alvo do app principal**. Não se sabe se isso aumenta o binário. Arquivo Swift novo em `Shared/` ou no `BlockingCore` só entra nos alvos depois de `pnpm sync:ios-shared` e de um novo prebuild: use `pnpm prebuild:ios` (sincroniza e roda `expo prebuild --platform ios --clean`). O `expo run:ios`, o EAS e o CI já sincronizam.
- **Manifesto de privacidade:** o de `app.json` vale só para o app; as extensões usam `UserDefaults` e podem precisar do próprio.
- **Dono das regras no Android:** ainda não implementado.

## Riscos

- O Swift do módulo e das extensões nunca foi executado: erros de runtime só aparecem na validação em aparelho. O CI macOS só garante que compila.
- `@bacons/apple-targets` não foi testado pelo autor em todos os tipos de extensão, e a assinatura de extensões com `family-controls` no EAS tem falhas relatadas.
- Minutos de macOS no GitHub Actions custam mais; o job fica restrito a PRs que tocam o iOS.
- A App Review pode questionar o uso; por isso o app não esconde apps por bundle id.

## Fora do escopo

- Palavras de busca no iOS e modo "filho" (controle parental).
- O `RulesSyncWorker` do Android só relê o que está salvo; sincronização real só com o app aberto. Vale uma PR separada.

## Ordem de merge da pilha do iOS

As PRs do iOS são empilhadas: cada uma aponta para a anterior. Mesclar **de baixo para cima**, uma por vez, com **merge commit** (sem squash e sem rebase), porque a PR de cima aponta para a branch de baixo e o squash reescreveria os commits dela. Ao mesclar, apague a branch: o GitHub reaponta a PR seguinte para `main`. A ordem é a da cadeia de bases: comece pela PR cuja base é `main` e siga sempre pela PR que aponta para a branch recém-mesclada, até a última da pilha.
