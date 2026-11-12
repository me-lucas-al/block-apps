import { describe, expect, it } from 'vitest'
import { WebSessionStorage } from '../WebSessionStorage'

class FakeStorage implements Storage {
  private readonly map = new Map<string, string>()

  get length(): number {
    return this.map.size
  }

  clear(): void {
    this.map.clear()
  }

  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
}

describe('WebSessionStorage', () => {
  it('saves, loads, and clears session tokens', async () => {
    const storage = new FakeStorage()
    const sessionStorage = new WebSessionStorage(storage)

    expect(await sessionStorage.load()).toBeNull()

    const tokens = {
      accessToken: 'acc',
      idToken: 'id',
      refreshToken: 'ref',
      email: 'admin@test.com',
      expiresAt: 123456,
    }

    await sessionStorage.save(tokens)
    expect(await sessionStorage.load()).toEqual(tokens)

    await sessionStorage.clear()
    expect(await sessionStorage.load()).toBeNull()
  })

  it('handles invalid json gracefully', async () => {
    const storage = new FakeStorage()
    storage.setItem('block_apps_admin_tokens', 'invalid json')
    const sessionStorage = new WebSessionStorage(storage)

    expect(await sessionStorage.load()).toBeNull()
  })
})
