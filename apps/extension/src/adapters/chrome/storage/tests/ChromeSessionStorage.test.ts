import { describe, expect, it, vi } from 'vitest'
import { ChromeSessionStorage } from '../ChromeSessionStorage'

describe('ChromeSessionStorage', () => {
  it('saves, loads and clears tokens in chrome.storage.local', async () => {
    const memory = new Map<string, unknown>()
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: memory.get(key) })),
          set: vi.fn(async (items: Record<string, unknown>) => {
            Object.entries(items).forEach(([k, v]) => memory.set(k, v))
          }),
          remove: vi.fn(async (key: string) => {
            memory.delete(key)
          }),
        },
      },
    })

    const storage = new ChromeSessionStorage()
    expect(await storage.load()).toBeNull()

    const tokens = { accessToken: 'acc', idToken: 'id', refreshToken: 'ref', email: 'e@test.com' }
    await storage.save(tokens)
    expect(await storage.load()).toEqual(tokens)

    await storage.clear()
    expect(await storage.load()).toBeNull()
  })
})
