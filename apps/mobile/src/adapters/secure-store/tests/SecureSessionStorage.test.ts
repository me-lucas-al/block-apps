import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecureSessionStorage } from '../SecureSessionStorage'

const secureStoreContents = new Map<string, string>()
const setItemAsync = vi.fn(async (key: string, storedValue: string) => {
  secureStoreContents.set(key, storedValue)
})

vi.mock('expo-secure-store', () => ({
  getItemAsync: async (key: string) => secureStoreContents.get(key) ?? null,
  setItemAsync: (key: string, storedValue: string) => setItemAsync(key, storedValue),
  deleteItemAsync: async (key: string) => {
    secureStoreContents.delete(key)
  },
}))

const tokens = { accessToken: 'a', idToken: 'b', refreshToken: 'c', email: 'm@test.com' }

describe('SecureSessionStorage', () => {
  beforeEach(() => {
    secureStoreContents.clear()
    setItemAsync.mockClear()
  })

  it('saves, loads and clears tokens', async () => {
    const storage = new SecureSessionStorage()
    expect(await storage.load()).toBeNull()

    await storage.save(tokens)
    expect(await storage.load()).toEqual(tokens)

    await storage.clear()
    expect(await storage.load()).toBeNull()
  })

  it('stores every token under its own key', async () => {
    await new SecureSessionStorage().save(tokens)

    expect(secureStoreContents.size).toBe(4)
    expect([...secureStoreContents.values()].sort()).toEqual(['a', 'b', 'c', 'm@test.com'])
  })

  it('treats a session with a missing token as signed out', async () => {
    const storage = new SecureSessionStorage()
    await storage.save(tokens)
    secureStoreContents.delete('block_apps_refresh_token')

    expect(await storage.load()).toBeNull()
  })

  it('removes the partial session when a write fails', async () => {
    setItemAsync.mockRejectedValueOnce(new Error('value too large'))
    const storage = new SecureSessionStorage()

    await expect(storage.save(tokens)).rejects.toThrow('value too large')

    expect(await storage.load()).toBeNull()
    expect(secureStoreContents.size).toBe(0)
  })

  it('migrates a session saved under the legacy single key', async () => {
    secureStoreContents.set('block_apps_tokens', JSON.stringify(tokens))
    const storage = new SecureSessionStorage()

    expect(await storage.load()).toEqual(tokens)

    expect(secureStoreContents.has('block_apps_tokens')).toBe(false)
    expect(secureStoreContents.get('block_apps_refresh_token')).toBe('c')
  })
})
