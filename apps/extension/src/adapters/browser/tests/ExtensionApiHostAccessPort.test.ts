import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExtensionApiHostAccessPort } from '../ExtensionApiHostAccessPort'

describe('ExtensionApiHostAccessPort', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('checks and requests access to every site', async () => {
    const contains = vi.fn(async () => false)
    const request = vi.fn(async () => true)
    vi.stubGlobal('chrome', { permissions: { contains, request } })
    const port = new ExtensionApiHostAccessPort()

    expect(await port.isGranted()).toBe(false)
    expect(await port.requestAccess()).toBe(true)
    expect(contains).toHaveBeenCalledWith({ origins: ['<all_urls>'] })
    expect(request).toHaveBeenCalledWith({ origins: ['<all_urls>'] })
  })
})
