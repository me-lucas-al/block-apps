import type { IncognitoPort } from '../../ports/browser/IncognitoPort'
import type { BrowserTarget } from '../../shared/browser/browserTarget'
import { ChromeIncognitoPort } from '../chrome/browser/ChromeIncognitoPort'
import { FirefoxIncognitoPort } from '../firefox/FirefoxIncognitoPort'

export function createIncognitoPort(target: BrowserTarget): IncognitoPort {
  if (target === 'firefox') return new FirefoxIncognitoPort()
  return new ChromeIncognitoPort()
}
