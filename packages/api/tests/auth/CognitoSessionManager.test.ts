import { describe, expect, it, vi } from 'vitest'
import { makeHarness, storedTokens } from './sessionManagerHarness'

function makeCognitoError(name: string): Error {
  const error = new Error(name)
  error.name = name
  return error
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
