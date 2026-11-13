import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildCognitoAuthenticatorForTest } from './buildCognitoAuthenticatorForTest'
import { buildCognitoSession, sdkScenario } from './cognitoSdkDouble'

vi.mock('amazon-cognito-identity-js', async () => {
  const double = await import('./cognitoSdkDouble')
  return {
    AuthenticationDetails: class {},
    CognitoUserPool: class {},
    CognitoUser: double.FakeCognitoUser,
  }
})

describe('CognitoAuthenticator.signInWithPassword', () => {
  beforeEach(() => {
    sdkScenario.current = () => undefined
  })

  it('stores the session and reports success', async () => {
    const session = buildCognitoSession({ accessToken: 'acc', idToken: 'id', refreshToken: 'ref' })
    sdkScenario.current = (callbacks) => callbacks.onSuccess(session)
    const { authenticator, storage } = buildCognitoAuthenticatorForTest()

    const result = await authenticator.signInWithPassword('a@b.com', 'pw')

    expect(result).toEqual({ success: true })
    expect(await storage.load()).toMatchObject({ email: 'a@b.com', refreshToken: 'ref' })
  })

  it('reports the challenge without storing a session', async () => {
    sdkScenario.current = (callbacks) => callbacks.totpRequired()
    const { authenticator, storage } = buildCognitoAuthenticatorForTest()

    const result = await authenticator.signInWithPassword('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'MFA_REQUIRED' } })
    expect(await storage.load()).toBeNull()
  })

  it('reports an unconfirmed user as a challenge', async () => {
    sdkScenario.current = (callbacks) => callbacks.onFailure({ code: 'UserNotConfirmedException' })
    const { authenticator } = buildCognitoAuthenticatorForTest()

    const result = await authenticator.signInWithPassword('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'CONFIRMATION_REQUIRED' } })
  })
})
