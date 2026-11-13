# Extensão Block Apps (Chrome, Edge e Firefox)

Manifest V3. O mesmo código gera os dois pacotes; só o manifesto e duas portas mudam.

## Build

```powershell
pnpm --filter @block-apps/extension build
pnpm --filter @block-apps/extension build:firefox
```

| Comando | Saída | Navegadores |
| --- | --- | --- |
| `build` | `apps/extension/dist` | Chrome e Edge |
| `build:firefox` | `apps/extension/dist-firefox` | Firefox 140 ou mais novo (desktop) |

`data_collection_permissions` só existe a partir do Firefox 140 no desktop e do 142 no Android, por isso são os mínimos do manifesto (`strict_min_version` e `gecko_android.strict_min_version`). O Firefox para Android não foi testado e não é um alvo suportado: a chave existe só para o AMO aceitar o pacote.

O manifesto é gerado por `manifest/` (`buildManifest(target)`), não existe `manifest.json` estático.
O build do Firefox usa `vite build --mode firefox` e injeta `VITE_TARGET_BROWSER=firefox`.

## O que muda no Firefox

| Ponto | Chrome | Firefox |
| --- | --- | --- |
| Segundo plano | `background.service_worker` | `background.scripts` (página de eventos) |
| Identificação | chave do Chrome Web Store | `browser_specific_settings.gecko.id` fixo |
| Permissão de sites | concedida na instalação | `host_permissions` pode ser revogada pelo usuário; o popup avisa e pede de novo (`HostAccessPort`) |
| Modo anônimo | abre `chrome://extensions/?id=...` | abre a página de ajuda de janelas privativas (`FirefoxIncognitoPort`), pois `about:addons` não abre por extensão |
| Declaração de dados | não existe | `data_collection_permissions` (`authenticationInfo`, `personallyIdentifyingInfo`) |

Sem `webextension-polyfill`: o Firefox aceita o namespace `chrome.*` com Promises no Manifest V3, e o próprio projeto do polyfill não recebe mais atualizações.

## Testar no Firefox

1. `pnpm --filter @block-apps/extension build:firefox`.
2. Abra `about:debugging#/runtime/this-firefox` e clique em "Carregar extensão temporária".
3. Escolha `apps/extension/dist-firefox/manifest.json`.
4. Em `about:addons`, na aba Permissões, confirme "Acessar seus dados para todos os sites" e "Executar em janelas privativas".

## Login com Google no Firefox

O Firefox devolve em `browser.identity.getRedirectURL()` uma URL no formato `https://<hash>.extensions.allizom.org/`, derivada do ID do add-on.

1. Instale a extensão uma vez e leia a URL no console do background (`about:debugging`, "Inspecionar") com `chrome.identity.getRedirectURL()`.
2. Informe a URL, com barra final, na variável Terraform `firefox_redirect_urls`. Ela entra nos `callback_urls` do client `device` do Cognito e a versão com `logout` nos `logout_urls`.
3. Rode `terraform plan` e `terraform apply` (nunca pelo console).

Como o ID está fixo no manifesto, a URL é a mesma em todas as instalações.

## Publicação (manual)

O CI só gera `block-apps-extension-firefox.zip` como artefato da release. O envio é manual:

1. Em addons.mozilla.org, criar o add-on com o ID `block-apps@block-apps.dev` (ajuste `FIREFOX_ADDON_ID` em `manifest/firefoxManifest.ts` antes do primeiro envio, pois o ID não muda depois).
2. Enviar o zip e confirmar a declaração de dados coletados (e-mail da conta e regras sincronizadas).
3. O Chrome Web Store e a Edge Add-ons seguem com `block-apps-extension.zip`.
