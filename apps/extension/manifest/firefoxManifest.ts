import { buildChromeManifest } from './chromeManifest'
import type { ExtensionManifest, GeckoCollectedData } from './ExtensionManifest'

export const FIREFOX_ADDON_ID = 'block-apps@block-apps.dev'
export const FIREFOX_MINIMUM_VERSION = '140.0'
export const FIREFOX_ANDROID_MINIMUM_VERSION = '142.0'
export const FIREFOX_COLLECTED_DATA: readonly GeckoCollectedData[] = [
  'authenticationInfo',
  'personallyIdentifyingInfo',
]

export function buildFirefoxManifest(): ExtensionManifest {
  const { minimum_chrome_version: _chromeOnlyKey, ...sharedKeys } = buildChromeManifest()
  return {
    ...sharedKeys,
    background: { scripts: ['background.js'], type: 'module' },
    optional_host_permissions: sharedKeys.host_permissions,
    browser_specific_settings: {
      gecko: {
        id: FIREFOX_ADDON_ID,
        strict_min_version: FIREFOX_MINIMUM_VERSION,
        data_collection_permissions: { required: FIREFOX_COLLECTED_DATA },
      },
      gecko_android: { strict_min_version: FIREFOX_ANDROID_MINIMUM_VERSION },
    },
  }
}
