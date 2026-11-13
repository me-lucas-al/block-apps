import { describe, expect, it, vi } from 'vitest'
import { LocalUserSession } from '../../src/auth/session/LocalUserSession'
import { MemorySessionStorage } from '../../src/auth/storage/MemorySessionStorage'

describe('LocalUserSession', () => {
  it('returns null email and tokens when empty', async () => {
    const storage = new MemorySessionStorage()
    const session = new LocalUserSession(storage)

    expect(await session.currentUserEmail()).toBeNull()
    expect(await session.currentIdToken()).toBeNull()
    expect(await session.currentAccessToken()).toBeNull()
  })

  it('notifies listeners when email changes', async () => {
    const storage = new MemorySessionStorage()
    const session = new LocalUserSession(storage)

    const listener = vi.fn()
    const unsubscribe = session.watchUserEmail(listener)

    await session.notifySessionUpdated({
      accessToken: 'acc',
      idToken: 'id',
      refreshToken: 'ref',
      email: 'user@example.com',
    })

    expect(listener).toHaveBeenCalledWith('user@example.com')

    unsubscribe()
    await session.notifySessionUpdated(null)
    expect(listener).not.toHaveBeenCalledWith(null)
  })

  it('notifies listeners when another context saved a session', async () => {
    const storage = new MemorySessionStorage()
    const session = new LocalUserSession(storage)
    await session.currentUserEmail()
    const listener = vi.fn()
    session.watchUserEmail(listener)

    await storage.save({
      accessToken: 'acc',
      idToken: 'id',
      refreshToken: 'ref',
      email: 'other@example.com',
    })
    await session.reloadFromStorage()

    expect(listener).toHaveBeenCalledWith('other@example.com')
  })
})
