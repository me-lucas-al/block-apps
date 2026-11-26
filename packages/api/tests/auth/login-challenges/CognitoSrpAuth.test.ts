import { afterEach, describe, expect, it, vi } from 'vitest'
import { CognitoSrpAuth } from '../../../src/auth/cognito/CognitoSrpAuth'
import { buildCognitoSession, signedInTokens } from '../../helpers/cognito/buildCognitoSession'
import { resetCognitoUserScript, scriptCognitoUser } from '../../helpers/cognito/FakeCognitoUser'
import {
  challengedEmail,
  raiseNewPasswordChallenge,
  raiseTotpChallenge,
  testCognitoConfig,
} from '../../helpers/cognito/startPendingChallenge'

vi.mock('amazon-cognito-identity-js', async () => {
  const { buildCognitoSdkModuleDouble } = await import('../../helpers/cognito/cognitoSdkModuleDouble')
  return buildCognitoSdkModuleDouble()
})

describe('CognitoSrpAuth.authenticate challenges', () => {
  afterEach(resetCognitoUserScript)

  it('returns the session tokens and clears the pending user on success', async () => {
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => callbacks.onSuccess(buildCognitoSession()) })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    const outcome = await srpAuth.authenticate(challengedEmail, 'password-1')

    expect(outcome.result).toEqual({ success: true })
    expect(outcome.tokens).toEqual({ ...signedInTokens, email: challengedEmail })
    expect(() => srpAuth.getPendingUser()).toThrow('No active authentication challenge')
  })

  it('reports the new password challenge and keeps the pending user', async () => {
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => raiseNewPasswordChallenge(callbacks) })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    const outcome = await srpAuth.authenticate(challengedEmail, 'password-1')

    expect(outcome.result).toEqual({ success: false, challenge: { kind: 'NEW_PASSWORD_REQUIRED' } })
    expect(outcome.tokens).toBeUndefined()
    expect(srpAuth.getActiveEmail()).toBe(challengedEmail)
    expect(() => srpAuth.getPendingUser()).not.toThrow()
  })

  it('reports the totp challenge and keeps the pending user', async () => {
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => raiseTotpChallenge(callbacks) })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    const outcome = await srpAuth.authenticate(challengedEmail, 'password-1')

    expect(outcome.result).toEqual({ success: false, challenge: { kind: 'MFA_REQUIRED' } })
    expect(srpAuth.getActiveEmail()).toBe(challengedEmail)
    expect(() => srpAuth.getPendingUser()).not.toThrow()
  })

  it('reports the mfa setup challenge with the secret code from the software token', async () => {
    scriptCognitoUser({
      authenticateUser: (_details, callbacks) => callbacks.mfaSetup?.('MFA_SETUP', {}),
      associateSoftwareToken: (callbacks) => callbacks.associateSecretCode('SECRET-CODE'),
    })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    const outcome = await srpAuth.authenticate(challengedEmail, 'password-1')

    expect(outcome.result).toEqual({
      success: false,
      challenge: { kind: 'MFA_SETUP', secretCode: 'SECRET-CODE' },
    })
    expect(() => srpAuth.getPendingUser()).not.toThrow()
  })
})
