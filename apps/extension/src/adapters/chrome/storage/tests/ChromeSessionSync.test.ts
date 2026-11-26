import type { LocalUserSession } from '@block-apps/api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChromeSessionSync } from '../ChromeSessionSync'

type StorageListener = (changes: Record<string, unknown>, areaName: string) => void

function stubChromeStorage() {
  const listeners = new Set<StorageListener>()
  vi.stubGlobal('chrome', {
    storage: {
      onChanged: {
        addListener: (listener: StorageListener) => listeners.add(listener),
        removeListener: (listener: StorageListener) => listeners.delete(listener),
      },
    },
  })
  return listeners
}

function startSync() {
  const reloadFromStorage = vi.fn().mockResolvedValue(undefined)
  const session = { reloadFromStorage } as unknown as LocalUserSession
  const stop = new ChromeSessionSync(session).start()
  return { reloadFromStorage, stop }
}

describe('ChromeSessionSync', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('reloads the session when the stored tokens change', () => {
    const listeners = stubChromeStorage()
    const { reloadFromStorage } = startSync()

    listeners.forEach((listener) => listener({ block_apps_tokens: {} }, 'local'))

    expect(reloadFromStorage).toHaveBeenCalledOnce()
  })

  it('ignores other keys and other storage areas', () => {
    const listeners = stubChromeStorage()
    const { reloadFromStorage } = startSync()

    listeners.forEach((listener) => listener({ other_key: {} }, 'local'))
    listeners.forEach((listener) => listener({ block_apps_tokens: {} }, 'sync'))

    expect(reloadFromStorage).not.toHaveBeenCalled()
  })

  it('stops listening after unsubscribe', () => {
    const listeners = stubChromeStorage()
    const { stop } = startSync()

    stop()

    expect(listeners.size).toBe(0)
  })
})
