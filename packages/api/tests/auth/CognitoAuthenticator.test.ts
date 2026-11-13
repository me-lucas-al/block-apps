import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CognitoAuthenticator } from '../../src/auth/cognito/CognitoAuthenticator'
import { LocalUserSession } from '../../src/auth/session/LocalUserSession'
import { MemorySessionStorage } from '../../src/auth/storage/MemorySessionStorage'
import { buildCognitoSession, sdkScenario } from './cognitoSdkDouble'

vi.mock('amazon-cognito-identity-js', async () => {
  const double = await import('./cognitoSdkDouble')
  return {
    AuthenticationDetails: class {},
    CognitoUserPool: class {},
    CognitoUser: double.FakeCognitoUser,
  }
})

const config = { userPoolId: 'pool-1', clientId: 'client-1', hostedDomain: 'auth.example.com' }

function buildAuthenticator() {
  const storage = new MemorySessionStorage()
  const authenticator = new CognitoAuthenticator(config, storage, new LocalUserSession(storage))
  return { authenticator, storage }
}

describe('CognitoAuthenticator.signInWithPassword', () => {
  beforeEach(() => {
    sdkScenario.current = () => undefined
  })

  it('stores the session and reports success', async () => {
    const session = buildCognitoSession({ accessToken: 'acc', idToken: 'id', refreshToken: 'ref' })
    sdkScenario.current = (callbacks) => callbacks.onSuccess(session)
    const { authenticator, storage } = buildAuthenticator()

    const result = await authenticator.signInWithPassword('a@b.com', 'pw')

    expect(result).toEqual({ success: true })
    expect(await storage.load()).toMatchObject({ email: 'a@b.com', refreshToken: 'ref' })
  })

  it('reports the challenge without storing a session', async () => {
    sdkScenario.current = (callbacks) => callbacks.totpRequired()
    const { authenticator, storage } = buildAuthenticator()

    const result = await authenticator.signInWithPassword('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'MFA_REQUIRED' } })
    expect(await storage.load()).toBeNull()
  })

  it('reports an unconfirmed user as a challenge', async () => {
    sdkScenario.current = (callbacks) => callbacks.onFailure({ code: 'UserNotConfirmedException' })
    const { authenticator } = buildAuthenticator()

    const result = await authenticator.signInWithPassword('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'CONFIRMATION_REQUIRED' } })
  })
})

describe('CognitoAuthenticator.signOut', () => {
  beforeEach(() => {
    sdkScenario.signOutCount = 0
  })

  it('revokes the stored refresh token and clears the session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const { authenticator, storage } = buildAuthenticator()
    await storage.save({
      accessToken: 'acc',
      idToken: 'id',
      refreshToken: 'ref-1',
      email: 'a@b.com',
    })

    await authenticator.signOut()

    expect(String(fetchMock.mock.calls[0]![1].body)).toContain('token=ref-1')
    expect(await storage.load()).toBeNull()
    expect(sdkScenario.signOutCount).toBe(1)
    vi.unstubAllGlobals()
  })

  it('still clears the session and reports the failure when the revocation is refused', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))
    const { authenticator, storage } = buildAuthenticator()
    await storage.save({
      accessToken: 'acc',
      idToken: 'id',
      refreshToken: 'ref-1',
      email: 'a@b.com',
    })

    await expect(authenticator.signOut()).rejects.toThrow('status 500')

    expect(await storage.load()).toBeNull()
    expect(sdkScenario.signOutCount).toBe(1)
    vi.unstubAllGlobals()
  })
})
