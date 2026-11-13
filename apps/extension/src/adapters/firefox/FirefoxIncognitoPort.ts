import type { IncognitoPort } from '../../ports/browser/IncognitoPort'

export const FIREFOX_PRIVATE_BROWSING_HELP_URL =
  'https://support.mozilla.org/kb/extensions-private-browsing'

export class FirefoxIncognitoPort implements IncognitoPort {
  isAllowed(): Promise<boolean> {
    return chrome.extension.isAllowedIncognitoAccess()
  }

  async openSettings(): Promise<void> {
    await chrome.tabs.create({ url: FIREFOX_PRIVATE_BROWSING_HELP_URL })
  }
}
