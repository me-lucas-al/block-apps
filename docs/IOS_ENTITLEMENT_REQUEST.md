# Pedido do entitlement Family Controls (distribuição)

A Apple só deixa o app usar a Screen Time API em TestFlight e na App Store depois de aprovar o entitlement `com.apple.developer.family-controls` de **distribuição**. É preciso pedir para o app e para cada extensão. Este arquivo tem o que preencher e o texto para colar.

**Antes de pedir:** assinar o Apple Developer Program (conta paga) e registrar os identificadores e o App Group no portal da Apple. Os nomes e a quantidade de campos do formulário podem mudar; confira na página do pedido, a partir de [developer.apple.com/contact/request/family-controls-distribution](https://developer.apple.com/contact/request/family-controls-distribution). Maiúsculas diferentes entre o identificador do portal e o do formulário travam o pedido (relato de desenvolvedores).

## Identificadores

Um pedido por identificador, todos com a mesma capability **Family Controls**:

| Alvo | Bundle identifier |
| --- | --- |
| App | `com.blockapps.mobile` |
| Monitor de atividade | `com.blockapps.mobile.monitor` |
| Configuração da tela de bloqueio | `com.blockapps.mobile.shieldconfig` |
| Ação da tela de bloqueio | `com.blockapps.mobile.shieldaction` |

App Group: `group.com.blockapps.mobile`. Use o mesmo texto nos quatro pedidos, trocando o identificador.

## Texto (em inglês, para colar no formulário)

**What does the app do?**
Block Apps is a self-control tool. The user chooses apps and websites they want to be blocked, either all the time or outside time windows they define (for example, social media on weekdays from 9 AM to 5 PM). Rules are stored in the user's own account so they survive a reinstall.

**Why does the app need the Family Controls entitlement?**
The app uses Screen Time API with individual authorization (`AuthorizationCenter.requestAuthorization(for: .individual)`) so that users can restrict their own device. It uses `FamilyActivityPicker` to let the user choose apps, `ManagedSettingsStore` to shield the selected apps and web domains, and `DeviceActivity` schedules so the shield follows the time windows the user configured. There is no parental-control or child-monitoring feature: every user restricts only their own device.

**How is this extension used?** (one line per extension)
- Monitor: `DeviceActivityMonitor` extension that re-applies the user's shield when a schedule boundary is reached.
- Shield configuration: `ShieldConfigurationDataSource` extension that shows a short "Blocked" screen.
- Shield action: `ShieldActionDelegate` extension that only closes the shield; it never lifts it.

**Optional strict mode.**
The user can opt in to a strict mode that sets `ManagedSettingsStore.application.denyAppRemoval` so the app cannot be removed in a moment of weakness. It is off by default, shows a clear warning before it is enabled, can only be disabled after the cooldown the user set, and switches itself off if the app has not been opened for 14 days.

**What data does the app collect?**
The app does not read, store or send app usage data. Selected apps are opaque tokens kept only on the device (shared with the extensions through an App Group). The account stores only the user's rules (a group name, the mode and the time windows), not which apps were selected.

**Can the user disable the restrictions?**
Yes. Changing or removing a rule that loosens a restriction waits for a cooldown the user set, to avoid impulsive changes. The user can always revoke the Screen Time authorization in Settings.

## Depois do envio

- A aprovação leva semanas, e pode vir uma pergunta da Apple por e-mail: responda com o texto acima.
- Quando aprovar, regenere os perfis de provisionamento (o EAS faz isso no próximo `eas build`) e siga os passos de `docs/IOS.md` (Builds e Validação em aparelho).
- Para a App Store, a revisão pode questionar o uso. Por isso o app não esconde apps pelo identificador do pacote, e o texto de privacidade da loja deve repetir o que está acima.
