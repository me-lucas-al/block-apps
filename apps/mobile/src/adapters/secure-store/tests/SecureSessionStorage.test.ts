import { describe, expect, it, vi } from 'vitest'
import { SecureSessionStorage } from '../SecureSessionStorage'

vi.mock('expo-secure-store', () => {
  const store = new Map<string, string>()
  return {
    getItemAsync: vi.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: vi.fn(async (key: string, val: string) => {
      store.set(key, val)
    }),
    deleteItemAsync: vi.fn(async (key: string) => {
      store.delete(key)
    }),
  }
})

describe('SecureSessionStorage', () => {
  it('saves, loads and clears tokens', async () => {
    const storage = new SecureSessionStorage()
    expect(await storage.load()).toBeNull()

    const tokens = { accessToken: 'a', idToken: 'b', refreshToken: 'c', email: 'm@test.com' }
    await storage.save(tokens)
    expect(await storage.load()).toEqual(tokens)

    await storage.clear()
    expect(await storage.load()).toBeNull()
  })
})
