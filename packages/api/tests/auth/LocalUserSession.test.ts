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
})
