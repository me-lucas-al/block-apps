import type { BrowserTarget } from '../src/shared/browser/browserTarget'
import { buildChromeManifest } from './chromeManifest'
import type { ExtensionManifest } from './ExtensionManifest'
import { buildFirefoxManifest } from './firefoxManifest'

export function buildManifest(target: BrowserTarget): ExtensionManifest {
  if (target === 'firefox') return buildFirefoxManifest()
  return buildChromeManifest()
}
