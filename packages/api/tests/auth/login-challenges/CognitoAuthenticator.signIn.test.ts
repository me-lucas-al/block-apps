import { afterEach, describe, expect, it, vi } from 'vitest'
import { CognitoAuthenticator } from '../../../src/auth/cognito/CognitoAuthenticator'
import { LocalUserSession } from '../../../src/auth/session/LocalUserSession'
import { MemorySessionStorage } from '../../../src/auth/storage/MemorySessionStorage'
import { buildCognitoSession, signedInTokens } from '../../helpers/cognito/buildCognitoSession'
import { resetCognitoUserScript, scriptCognitoUser } from '../../helpers/cognito/FakeCognitoUser'
import { challengedEmail, testCognitoConfig } from '../../helpers/cognito/cognitoTestFixtures'
import {
  raiseMfaSetupChallenge,
  raiseNewPasswordChallenge,
  raiseTotpChallenge,
} from '../../helpers/cognito/signInChallengeRaisers'

vi.mock('amazon-cognito-identity-js', async () => {
  const { buildCognitoSdkModuleDouble } = await import('../../helpers/cognito/cognitoSdkModuleDouble')
  return buildCognitoSdkModuleDouble()
})

function buildAuthenticatorWithStorage(): {
  authenticator: CognitoAuthenticator
  storage: MemorySessionStorage
} {
  const storage = new MemorySessionStorage()
  const authenticator = new CognitoAuthenticator(testCognitoConfig, storage, new LocalUserSession(storage))
  return { authenticator, storage }
}

describe('CognitoAuthenticator.signInWithPassword', () => {
  afterEach(resetCognitoUserScript)

  it('persists the tokens and returns signed_in on success', async () => {
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => callbacks.onSuccess(buildCognitoSession()) })
    const { authenticator, storage } = buildAuthenticatorWithStorage()

    const signInResult = await authenticator.signInWithPassword(challengedEmail, 'password-1')

    expect(signInResult).toEqual({ kind: 'signed_in' })
    expect(await storage.load()).toEqual({ ...signedInTokens, email: challengedEmail })
  })

  it('returns the challenge without persisting tokens or throwing', async () => {
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => raiseTotpChallenge(callbacks) })
    const { authenticator, storage } = buildAuthenticatorWithStorage()

    const signInResult = await authenticator.signInWithPassword(challengedEmail, 'password-1')

    expect(signInResult).toEqual({ kind: 'mfa_totp_required' })
    expect(await storage.load()).toBeNull()
  })

  it('returns the mfa setup secret without persisting tokens', async () => {
    scriptCognitoUser({
      authenticateUser: (_details, callbacks) => raiseMfaSetupChallenge(callbacks),
      associateSoftwareToken: (callbacks) => callbacks.associateSecretCode('SECRET-CODE'),
    })
    const { authenticator, storage } = buildAuthenticatorWithStorage()

    const signInResult = await authenticator.signInWithPassword(challengedEmail, 'password-1')

    expect(signInResult).toEqual({ kind: 'mfa_setup_required', secretCode: 'SECRET-CODE' })
    expect(await storage.load()).toBeNull()
  })

  it('returns the new password challenge without persisting tokens', async () => {
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => raiseNewPasswordChallenge(callbacks) })
    const { authenticator, storage } = buildAuthenticatorWithStorage()

    const signInResult = await authenticator.signInWithPassword(challengedEmail, 'password-1')

    expect(signInResult).toEqual({ kind: 'new_password_required' })
    expect(await storage.load()).toBeNull()
  })

  it('returns unconfirmed_user instead of rejecting', async () => {
    const failure = Object.assign(new Error('not confirmed'), { name: 'UserNotConfirmedException' })
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => callbacks.onFailure(failure) })
    const { authenticator } = buildAuthenticatorWithStorage()

    await expect(authenticator.signInWithPassword(challengedEmail, 'password-1')).resolves.toEqual({
      kind: 'unconfirmed_user',
    })
  })

  it('still rejects with the original error for other failures', async () => {
    const failure = Object.assign(new Error('wrong password'), { name: 'NotAuthorizedException' })
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => callbacks.onFailure(failure) })
    const { authenticator } = buildAuthenticatorWithStorage()

    await expect(authenticator.signInWithPassword(challengedEmail, 'wrong')).rejects.toBe(failure)
  })
})
