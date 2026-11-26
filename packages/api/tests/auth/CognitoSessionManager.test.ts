import { describe, expect, it, vi } from 'vitest'
import type { CognitoAccountOps } from '../../src/auth/cognito/CognitoAccountOps'
import { CognitoSessionManager } from '../../src/auth/cognito/CognitoSessionManager'
import type { CognitoTokenRevoker } from '../../src/auth/cognito/CognitoTokenRevoker'
import type { SessionTokens } from '../../src/auth/contracts/SessionTokens'
import { SessionRevocationError } from '../../src/auth/SessionRevocationError'
import { LocalUserSession } from '../../src/auth/session/LocalUserSession'
import { MemorySessionStorage } from '../../src/auth/storage/MemorySessionStorage'

const storedTokens: SessionTokens = {
  accessToken: 'old-access',
  idToken: 'old-id',
  refreshToken: 'refresh-1',
  email: 'user@example.com',
}

function makeCognitoError(name: string): Error {
  const error = new Error(name)
  error.name = name
  return error
}

async function makeHarness(
  refreshSession: CognitoAccountOps['refreshSession'],
  revokeRefreshToken: CognitoTokenRevoker['revokeRefreshToken'] = vi.fn(),
) {
  const storage = new MemorySessionStorage()
  await storage.save(storedTokens)
  const clearCachedSession = vi.fn()
  const accountOps = { refreshSession, clearCachedSession } as unknown as CognitoAccountOps
  const tokenRevoker = { revokeRefreshToken } as unknown as CognitoTokenRevoker
  const manager = new CognitoSessionManager(
    storage,
    new LocalUserSession(storage),
    accountOps,
    tokenRevoker,
  )
  return { storage, manager, clearCachedSession, revokeRefreshToken }
}

describe('CognitoSessionManager.refreshSession', () => {
  it('stores and returns the refreshed tokens', async () => {
    const refreshedTokens = { ...storedTokens, idToken: 'new-id' }
    const { storage, manager } = await makeHarness(vi.fn().mockResolvedValue(refreshedTokens))

    expect(await manager.refreshSession()).toEqual(refreshedTokens)
    expect(await storage.load()).toEqual(refreshedTokens)
  })

  it('keeps the session when the refresh fails for a temporary reason', async () => {
    const networkFailure = vi.fn().mockRejectedValue(new Error('Network error'))
    const { storage, manager } = await makeHarness(networkFailure)

    expect(await manager.refreshSession()).toBeNull()
    expect(await storage.load()).toEqual(storedTokens)
  })

  it('clears the session when Cognito rejects the refresh token', async () => {
    const rejectedToken = vi.fn().mockRejectedValue(makeCognitoError('NotAuthorizedException'))
    const { storage, manager } = await makeHarness(rejectedToken)

    expect(await manager.refreshSession()).toBeNull()
    expect(await storage.load()).toBeNull()
  })
})

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
