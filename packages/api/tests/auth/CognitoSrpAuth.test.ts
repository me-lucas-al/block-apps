import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CognitoSrpAuth } from '../../src/auth/cognito/CognitoSrpAuth'
import { buildCognitoSession, sdkScenario } from './cognitoSdkDouble'

vi.mock('amazon-cognito-identity-js', async () => {
  const double = await import('./cognitoSdkDouble')
  return {
    AuthenticationDetails: class {},
    CognitoUserPool: class {},
    CognitoUser: double.FakeCognitoUser,
  }
})

const config = { userPoolId: 'pool-1', clientId: 'client-1' }

describe('CognitoSrpAuth.authenticate', () => {
  beforeEach(() => {
    sdkScenario.current = () => undefined
  })

  it('returns the session tokens on success', async () => {
    const session = buildCognitoSession({ accessToken: 'acc', idToken: 'id', refreshToken: 'ref' })
    sdkScenario.current = (callbacks) => callbacks.onSuccess(session)

    const { result, tokens } = await new CognitoSrpAuth(config).authenticate('a@b.com', 'pw')

    expect(result).toEqual({ success: true })
    expect(tokens).toEqual({
      accessToken: 'acc',
      idToken: 'id',
      refreshToken: 'ref',
      email: 'a@b.com',
    })
  })

  it('returns the new password challenge and keeps the pending user', async () => {
    sdkScenario.current = (callbacks) => callbacks.newPasswordRequired()
    const srpAuth = new CognitoSrpAuth(config)

    const { result, tokens } = await srpAuth.authenticate('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'NEW_PASSWORD_REQUIRED' } })
    expect(tokens).toBeUndefined()
    expect(() => srpAuth.getPendingUser()).not.toThrow()
  })

  it('returns the mfa challenge', async () => {
    sdkScenario.current = (callbacks) => callbacks.totpRequired()

    const { result } = await new CognitoSrpAuth(config).authenticate('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'MFA_REQUIRED' } })
  })

  it('returns the mfa setup challenge with the secret code', async () => {
    sdkScenario.current = (callbacks) => callbacks.mfaSetup()

    const { result } = await new CognitoSrpAuth(config).authenticate('a@b.com', 'pw')

    expect(result).toEqual({
      success: false,
      challenge: { kind: 'MFA_SETUP', secretCode: 'SECRET-CODE' },
    })
  })

  it('returns the reset challenge when Cognito requires a password reset', async () => {
    const failure = { code: 'PasswordResetRequiredException' }
    sdkScenario.current = (callbacks) => callbacks.onFailure(failure)
    const srpAuth = new CognitoSrpAuth(config)

    const { result } = await srpAuth.authenticate('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'RESET_REQUIRED' } })
    expect(() => srpAuth.getPendingUser()).toThrow('No active authentication challenge')
  })

  it('returns the confirmation challenge for an unconfirmed user', async () => {
    sdkScenario.current = (callbacks) =>
      callbacks.onFailure({ code: 'UserNotConfirmedException' })

    const { result } = await new CognitoSrpAuth(config).authenticate('a@b.com', 'pw')

    expect(result).toEqual({ success: false, challenge: { kind: 'CONFIRMATION_REQUIRED' } })
  })

  it('rejects wrong credentials', async () => {
    const failure = { code: 'NotAuthorizedException', message: 'Incorrect username or password.' }
    sdkScenario.current = (callbacks) => callbacks.onFailure(failure)

    await expect(new CognitoSrpAuth(config).authenticate('a@b.com', 'bad')).rejects.toBe(failure)
  })
})
