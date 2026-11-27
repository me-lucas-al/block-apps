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

`dev` e `dev:firefox` fazem o mesmo build em modo observação.

O manifesto é gerado por `manifest/` (`buildManifest(target)`), não existe `manifest.json` estático.
O build do Firefox usa `vite build --mode firefox` e injeta `VITE_TARGET_BROWSER=firefox`.

## O que muda no Firefox

| Ponto | Chrome | Firefox |
| --- | --- | --- |
| Segundo plano | `background.service_worker` | `background.scripts` (página de eventos) |
| Identificação | chave do Chrome Web Store | `browser_specific_settings.gecko.id` fixo |
| Permissão de sites | concedida na instalação | `host_permissions` pode ser revogada pelo usuário; o popup avisa e pede de novo (`HostAccessPort`) |
| Modo anônimo | abre `chrome://extensions/?id=...` ("Abrir configurações") | abre a página de ajuda de janelas privativas ("Ver como ativar"), pois `about:addons` não abre por extensão (`FirefoxIncognitoPort`) |
| Declaração de dados | não existe | `data_collection_permissions` (`authenticationInfo`, `personallyIdentifyingInfo`) |

Sem `webextension-polyfill`: o Firefox aceita o namespace `chrome.*` com Promises no Manifest V3, e o próprio projeto do polyfill não recebe mais atualizações.

### Por que `host_permissions` e `optional_host_permissions` são iguais

No Firefox os dois valem `<all_urls>`. `host_permissions` pede o acesso na instalação (o Firefox mostra o pedido a partir da versão 127). `optional_host_permissions` existe porque o usuário pode revogar o acesso em `about:addons` e `permissions.request()` só consegue pedir de volta origens declaradas como opcionais. Sem isso o botão "Conceder acesso" do popup falharia depois de uma revogação. No Chrome a chave opcional não é gerada.

## Testar no Firefox

1. `pnpm --filter @block-apps/extension build:firefox`.
2. Abra `about:debugging#/runtime/this-firefox` e clique em "Carregar extensão temporária".
3. Escolha `apps/extension/dist-firefox/manifest.json`.
4. Em `about:addons`, na aba Permissões, confirme "Acessar seus dados para todos os sites" e "Executar em janelas privativas".

## Login com Google no Firefox

O Firefox devolve em `browser.identity.getRedirectURL()` uma URL no formato `https://<hash>.extensions.allizom.org/`, onde `<hash>` é o SHA-1, em hexadecimal, do ID do add-on.

Para o ID atual (`block-apps@block-apps.dev`) o valor esperado é:

```
https://663c73f5c9fd763da1f0cd8d249eeddd7ff8bea7.extensions.allizom.org/
```

Esse valor foi calculado, não lido no navegador. Para recalcular depois de mudar o ID: `node -e "console.log(require('crypto').createHash('sha1').update('block-apps@block-apps.dev').digest('hex'))"`.

1. Instale a extensão uma vez e leia a URL no console do background (`about:debugging`, "Inspecionar") com `chrome.identity.getRedirectURL()`. Confirme que é igual ao valor acima.
2. Informe a URL, com barra final, na variável Terraform `firefox_redirect_urls`. Ela entra nos `callback_urls` do client `device` do Cognito e a versão com `logout` nos `logout_urls`.
   - Localmente: `infra/environments/dev/terraform.tfvars` (exemplo em `terraform.tfvars.example`).
   - Na release: variável do GitHub `FIREFOX_REDIRECT_URLS`, uma lista em JSON como `["https://...extensions.allizom.org/"]`. O `release.yml` e o `terraform-plan.yml` a leem como `TF_VAR_firefox_redirect_urls`, junto com `EXTENSION_IDS` (IDs da extensão no Chrome e no Edge; confirme se o Edge usa o mesmo ID do Chrome). Sem essas variáveis o valor é `[]` e o apply remove os redirects da extensão.
3. Rode `terraform plan` e `terraform apply` (nunca pelo console).

Como o ID está fixo no manifesto, a URL é a mesma em todas as instalações.

### Teste manual do login com Google

O fluxo do Google roda no background (`src/background/googleSignInListener.ts`), já está em `main` e deve terminar mesmo com o popup fechado. Os passos abaixo conferem isso no Firefox.

1. Carregue `dist-firefox` como extensão temporária e confirme que o Terraform já tem a URL em `firefox_redirect_urls`.
2. Abra o popup, deslogado, e clique em entrar com Google.
3. Feche o popup durante a janela do Google: o login deve terminar mesmo assim.
4. Conclua o login e reabra o popup: o e-mail aparece e as regras carregam.
5. Se aparecer erro de `redirect_uri_mismatch` ou de callback inválido, a URL de `getRedirectURL()` não bate com `firefox_redirect_urls`.

## Publicação (manual)

A release gera um artefato por navegador: `block-apps-extension-chrome`, `block-apps-extension-firefox` e `block-apps-source` (código-fonte). O envio às lojas é manual:

1. Em addons.mozilla.org, criar o add-on com o ID `block-apps@block-apps.dev` (ajuste `FIREFOX_ADDON_ID` em `manifest/firefoxManifest.ts` antes do primeiro envio, pois o ID não muda depois).
2. Enviar `block-apps-extension-firefox.zip` e confirmar a declaração de dados coletados (e-mail da conta e regras sincronizadas).
3. O código é empacotado pelo Vite, então o AMO pede o código-fonte: anexe `block-apps-source.zip` e informe como reproduzir o pacote: Node 24, `pnpm install --frozen-lockfile`, `pnpm --filter @block-apps/extension build:firefox`, resultado em `apps/extension/dist-firefox`.
4. O Chrome Web Store e a Edge Add-ons seguem com `block-apps-extension-chrome` (`block-apps-extension.zip`).

### Checklist do AMO

- [ ] ID Gecko confirmado em `manifest/firefoxManifest.ts`. Ele não muda depois do primeiro envio.
- [ ] `getRedirectURL()` lido no navegador e igual ao valor documentado acima.
- [ ] `FIREFOX_REDIRECT_URLS` e `EXTENSION_IDS` definidas no GitHub, no ambiente `production` e no nível do repositório, e `terraform apply` feito pela release.
- [ ] Login com Google no background worker já mesclado em `main` (PR "bring stranded auth fixes into main"), e testado no Firefox, inclusive fechando o popup no meio.
- [ ] `block-apps-extension-firefox.zip` e `block-apps-source.zip` enviados, com as instruções de build.
- [ ] Declaração de dados coletados conferida (`authenticationInfo` e `personallyIdentifyingInfo`).
- [ ] Versão do `manifest` incrementada antes de gerar a release.
- [ ] Cadastro no AMO: política de privacidade com URL, descrição, categoria, ícones, capturas de tela e escolha entre listado e não listado.
