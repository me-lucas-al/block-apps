import type { IncognitoPort } from '../../../ports/browser/IncognitoPort'
import { isIncognitoAccessAllowed } from '../../browser/isIncognitoAccessAllowed'

export class ChromeIncognitoPort implements IncognitoPort {
  readonly settingName = 'Permitir no modo anônimo'
  readonly openSettingsLabel = 'Abrir configurações'

  isAllowed(): Promise<boolean> {
    return isIncognitoAccessAllowed()
  }

  async openSettings(): Promise<void> {
    await chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` })
  }
}
