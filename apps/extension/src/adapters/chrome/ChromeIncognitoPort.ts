import type { IncognitoPort } from '../../ports/IncognitoPort'

export class ChromeIncognitoPort implements IncognitoPort {
  isAllowed(): Promise<boolean> {
    return chrome.extension.isAllowedIncognitoAccess()
  }

  async openSettings(): Promise<void> {
    await chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` })
  }
}
