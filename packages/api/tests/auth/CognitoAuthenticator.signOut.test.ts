import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionRevocationError } from '../../src/auth/SessionRevocationError'
import { buildCognitoAuthenticatorForTest } from './buildCognitoAuthenticatorForTest'
import { sdkScenario } from './cognitoSdkDouble'

vi.mock('amazon-cognito-identity-js', async () => {
  const double = await import('./cognitoSdkDouble')
  return {
    AuthenticationDetails: class {},
    CognitoUserPool: class {},
    CognitoUser: double.FakeCognitoUser,
  }
})

const storedTokens = {
  accessToken: 'acc',
  idToken: 'id',
  refreshToken: 'ref-1',
  email: 'a@b.com',
}

describe('CognitoAuthenticator.signOut', () => {
  beforeEach(() => {
    sdkScenario.signOutCount = 0
  })
  afterEach(() => vi.unstubAllGlobals())

  it('revokes the stored refresh token and clears the session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const { authenticator, storage } = buildCognitoAuthenticatorForTest()
    await storage.save(storedTokens)

    await authenticator.signOut()

    expect(String(fetchMock.mock.calls[0]![1].body)).toContain('token=ref-1')
    expect(await storage.load()).toBeNull()
    expect(sdkScenario.signOutCount).toBe(1)
  })

  it('still clears the session and reports the failure when the revocation is refused', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))
    const { authenticator, storage } = buildCognitoAuthenticatorForTest()
    await storage.save(storedTokens)

    await expect(authenticator.signOut()).rejects.toBeInstanceOf(SessionRevocationError)

    expect(await storage.load()).toBeNull()
    expect(sdkScenario.signOutCount).toBe(1)
  })
})
