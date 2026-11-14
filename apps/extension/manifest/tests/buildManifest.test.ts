import { describe, expect, it } from 'vitest'
import { buildManifest } from '../buildManifest'
import {
  FIREFOX_ADDON_ID,
  FIREFOX_ANDROID_MINIMUM_VERSION,
  FIREFOX_COLLECTED_DATA,
  FIREFOX_MINIMUM_VERSION,
} from '../firefoxManifest'

describe('buildManifest', () => {
  it('keeps the chrome manifest on a service worker with a minimum chrome version', () => {
    const manifest = buildManifest('chrome')

    expect(manifest.background).toEqual({ service_worker: 'background.js', type: 'module' })
    expect(manifest.minimum_chrome_version).toBe('110')
    expect(manifest.browser_specific_settings).toBeUndefined()
  })

  it('uses background scripts and a fixed addon id for firefox', () => {
    const manifest = buildManifest('firefox')

    expect(manifest.background).toEqual({ scripts: ['background.js'], type: 'module' })
    expect(manifest.browser_specific_settings?.gecko.id).toBe(FIREFOX_ADDON_ID)
    expect(manifest.browser_specific_settings?.gecko.data_collection_permissions.required).toEqual(
      FIREFOX_COLLECTED_DATA,
    )
  })

  it('requires the firefox versions that understand data collection permissions', () => {
    const settings = buildManifest('firefox').browser_specific_settings

    expect(FIREFOX_MINIMUM_VERSION).toBe('140.0')
    expect(settings?.gecko.strict_min_version).toBe('140.0')
    expect(settings?.gecko_android?.strict_min_version).toBe(FIREFOX_ANDROID_MINIMUM_VERSION)
    expect(FIREFOX_ANDROID_MINIMUM_VERSION).toBe('142.0')
  })

  it('drops the chrome only key and lets firefox request host access at runtime', () => {
    const manifest = buildManifest('firefox')

    expect(manifest).not.toHaveProperty('minimum_chrome_version')
    expect(manifest.optional_host_permissions).toEqual(manifest.host_permissions)
  })

  it('declares the same permissions on both browsers', () => {
    expect(buildManifest('firefox').permissions).toEqual(buildManifest('chrome').permissions)
  })
})
