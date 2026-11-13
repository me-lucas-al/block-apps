import type { ExtensionManifest } from './ExtensionManifest'

export const CHROME_MINIMUM_VERSION = '110'

export function buildChromeManifest(): ExtensionManifest {
  return {
    manifest_version: 3,
    name: 'Block Apps',
    version: '0.1.0',
    description:
      'Bloqueia sites e buscas por palavras proibidas, sempre ou fora de horarios permitidos.',
    minimum_chrome_version: CHROME_MINIMUM_VERSION,
    action: { default_popup: 'popup.html', default_title: 'Block Apps' },
    background: { service_worker: 'background.js', type: 'module' },
    permissions: ['identity', 'storage', 'alarms', 'declarativeNetRequest', 'webNavigation'],
    host_permissions: ['<all_urls>'],
    incognito: 'spanning',
    web_accessible_resources: [{ resources: ['blocked.html'], matches: ['<all_urls>'] }],
  }
}
