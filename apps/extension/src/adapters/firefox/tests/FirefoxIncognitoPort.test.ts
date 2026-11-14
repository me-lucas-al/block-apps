import { afterEach, describe, expect, it, vi } from 'vitest'
import { FIREFOX_PRIVATE_BROWSING_HELP_URL, FirefoxIncognitoPort } from '../FirefoxIncognitoPort'

describe('FirefoxIncognitoPort', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('reads private window access from the extension api', async () => {
    vi.stubGlobal('chrome', { extension: { isAllowedIncognitoAccess: async () => false } })

    expect(await new FirefoxIncognitoPort().isAllowed()).toBe(false)
  })

  it('opens the help page because firefox blocks about:addons for extensions', async () => {
    const createTab = vi.fn(async () => undefined)
    vi.stubGlobal('chrome', { tabs: { create: createTab } })

    await new FirefoxIncognitoPort().openSettings()

    expect(createTab).toHaveBeenCalledWith({ url: FIREFOX_PRIVATE_BROWSING_HELP_URL })
  })

  it('labels the action honestly as a guide and names the firefox setting', () => {
    const port = new FirefoxIncognitoPort()

    expect(port.settingName).toBe('Executar em janelas privativas')
    expect(port.openSettingsLabel).toBe('Ver como ativar')
  })
})
