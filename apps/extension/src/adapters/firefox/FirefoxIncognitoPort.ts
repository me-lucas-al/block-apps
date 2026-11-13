import type { IncognitoPort } from '../../ports/browser/IncognitoPort'
import { isIncognitoAccessAllowed } from '../browser/isIncognitoAccessAllowed'

export const FIREFOX_PRIVATE_BROWSING_HELP_URL =
  'https://support.mozilla.org/kb/extensions-private-browsing'

export class FirefoxIncognitoPort implements IncognitoPort {
  readonly settingName = 'Executar em janelas privativas'
  readonly openSettingsLabel = 'Ver como ativar'

  isAllowed(): Promise<boolean> {
    return isIncognitoAccessAllowed()
  }

  async openSettings(): Promise<void> {
    await chrome.tabs.create({ url: FIREFOX_PRIVATE_BROWSING_HELP_URL })
  }
}
