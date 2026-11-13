import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChromeIncognitoPort } from '../../chrome/browser/ChromeIncognitoPort'
import {
  FIREFOX_PRIVATE_BROWSING_HELP_URL,
  FirefoxIncognitoPort,
} from '../../firefox/FirefoxIncognitoPort'
import { createIncognitoPort } from '../createIncognitoPort'

describe('createIncognitoPort', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('picks the chrome port for chrome and the firefox port for firefox', () => {
    expect(createIncognitoPort('chrome')).toBeInstanceOf(ChromeIncognitoPort)
    expect(createIncognitoPort('firefox')).toBeInstanceOf(FirefoxIncognitoPort)
  })

  it('opens the private browsing help page on firefox', async () => {
    const createTab = vi.fn(async () => undefined)
    vi.stubGlobal('chrome', { tabs: { create: createTab } })

    await createIncognitoPort('firefox').openSettings()

    expect(createTab).toHaveBeenCalledWith({ url: FIREFOX_PRIVATE_BROWSING_HELP_URL })
  })

  it('reads the private browsing permission from the extension api', async () => {
    vi.stubGlobal('chrome', { extension: { isAllowedIncognitoAccess: async () => true } })

    expect(await createIncognitoPort('firefox').isAllowed()).toBe(true)
  })
})
