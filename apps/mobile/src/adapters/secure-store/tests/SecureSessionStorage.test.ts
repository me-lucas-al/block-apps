import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecureSessionStorage } from '../SecureSessionStorage'
import {
  getItemAsync,
  refreshedTokens,
  rejectWriteNumber,
  resetSecureStoreFake,
  secureStoreContents,
  tokens,
} from './secureStoreFake'

vi.mock('expo-secure-store', async () => (await import('./secureStoreFake')).secureStoreModule)

describe('SecureSessionStorage', () => {
  beforeEach(resetSecureStoreFake)

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

    expect([...secureStoreContents.values()].sort()).toEqual(['a', 'b', 'c', 'm@test.com'])
  })

  it('treats a session with a missing token as signed out', async () => {
    const storage = new SecureSessionStorage()
    await storage.save(tokens)
    secureStoreContents.delete('block_apps_refresh_token')

    expect(await storage.load()).toBeNull()
  })

  it('reports a failure to read the secure store instead of hiding it', async () => {
    getItemAsync.mockRejectedValue(new Error('keystore unavailable'))

    await expect(new SecureSessionStorage().load()).rejects.toThrow('keystore unavailable')
  })

  it('keeps the previous session when a refresh fails halfway', async () => {
    const storage = new SecureSessionStorage()
    await storage.save(tokens)
    rejectWriteNumber(3)

    await expect(storage.save(refreshedTokens)).rejects.toThrow('value too large')

    expect(await storage.load()).toEqual(tokens)
  })

  it('leaves nothing behind when the first save fails halfway', async () => {
    rejectWriteNumber(3)

    await expect(new SecureSessionStorage().save(tokens)).rejects.toThrow('value too large')

    expect(secureStoreContents.size).toBe(0)
  })

  it('does not touch the legacy session when a save fails', async () => {
    secureStoreContents.set('block_apps_tokens', JSON.stringify(tokens))
    rejectWriteNumber(1)

    await expect(new SecureSessionStorage().save(refreshedTokens)).rejects.toThrow('too large')

    expect(secureStoreContents.get('block_apps_tokens')).toBe(JSON.stringify(tokens))
  })

  it('runs a load after a save that was started before it', async () => {
    const storage = new SecureSessionStorage()

    const [, loadedTokens] = await Promise.all([storage.save(tokens), storage.load()])

    expect(loadedTokens).toEqual(tokens)
  })

  it('keeps serving the queue after a failed operation', async () => {
    const storage = new SecureSessionStorage()
    rejectWriteNumber(1)
    const failedSave = storage.save(tokens)
    const laterLoad = storage.load()

    await expect(failedSave).rejects.toThrow('value too large')
    expect(await laterLoad).toBeNull()
  })
})
