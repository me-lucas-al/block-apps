import { describe, expect, it, vi } from 'vitest'
import { SessionRevocationError } from '../../src/auth/SessionRevocationError'
import { makeHarness } from './sessionManagerHarness'

describe('CognitoSessionManager.signOut', () => {
  it('revokes the refresh token and clears the local session', async () => {
    const { storage, manager, clearCachedSession, revokeRefreshToken } = await makeHarness(vi.fn())

    await manager.signOut()

    expect(revokeRefreshToken).toHaveBeenCalledWith('refresh-1')
    expect(clearCachedSession).toHaveBeenCalledWith('user@example.com')
    expect(await storage.load()).toBeNull()
  })

  it('clears the local session and reports the failure when the revocation fails', async () => {
    const failedRevocation = vi.fn().mockRejectedValue(new Error('Network error'))
    const { storage, manager, clearCachedSession } = await makeHarness(vi.fn(), failedRevocation)

    await expect(manager.signOut()).rejects.toBeInstanceOf(SessionRevocationError)

    expect(clearCachedSession).toHaveBeenCalledWith('user@example.com')
    expect(await storage.load()).toBeNull()
  })

  it('still forgets the session when clearing the sdk cache throws', async () => {
    const { storage, manager, clearCachedSession } = await makeHarness(vi.fn())
    clearCachedSession.mockImplementation(() => {
      throw new Error('cache failure')
    })

    await expect(manager.signOut()).rejects.toThrow('cache failure')

    expect(await storage.load()).toBeNull()
  })

  it('reports a storage read failure and still clears the stored session', async () => {
    const { storage, manager, revokeRefreshToken } = await makeHarness(vi.fn())
    const clearStorage = vi.spyOn(storage, 'clear')
    vi.spyOn(storage, 'load').mockRejectedValue(new Error('read failed'))

    await expect(manager.signOut()).rejects.toThrow('read failed')

    expect(revokeRefreshToken).not.toHaveBeenCalled()
    expect(clearStorage).toHaveBeenCalled()
  })

  it('does nothing on the server when there is no session', async () => {
    const { storage, manager, revokeRefreshToken } = await makeHarness(vi.fn())
    await storage.clear()

    await manager.signOut()

    expect(revokeRefreshToken).not.toHaveBeenCalled()
  })
})
