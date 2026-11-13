import type { IncognitoPort } from '../../ports/browser/IncognitoPort'
import { type BrowserTarget, readBrowserTarget } from '../../shared/browser/browserTarget'
import { ChromeIncognitoPort } from '../chrome/browser/ChromeIncognitoPort'
import { FirefoxIncognitoPort } from '../firefox/FirefoxIncognitoPort'

export function createIncognitoPort(target: BrowserTarget = readBrowserTarget()): IncognitoPort {
  if (target === 'firefox') return new FirefoxIncognitoPort()
  return new ChromeIncognitoPort()
}
