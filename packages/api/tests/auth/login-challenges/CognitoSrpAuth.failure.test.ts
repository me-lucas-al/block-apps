import { afterEach, describe, expect, it, vi } from 'vitest'
import { CognitoSrpAuth } from '../../../src/auth/cognito/CognitoSrpAuth'
import { resetCognitoUserScript, scriptCognitoUser } from '../../helpers/cognito/FakeCognitoUser'
import { challengedEmail, testCognitoConfig } from '../../helpers/cognito/cognitoTestFixtures'
import { raiseMfaSetupChallenge, raiseTotpChallenge } from '../../helpers/cognito/signInChallengeRaisers'

vi.mock('amazon-cognito-identity-js', async () => {
  const { buildCognitoSdkModuleDouble } = await import('../../helpers/cognito/cognitoSdkModuleDouble')
  return buildCognitoSdkModuleDouble()
})

function buildNotAuthorizedError(): Error {
  const error = new Error('Incorrect username or password.')
  error.name = 'NotAuthorizedException'
  return error
}

describe('CognitoSrpAuth.authenticate failures', () => {
  afterEach(resetCognitoUserScript)

  it('rejects with the original error and clears the pending user on onFailure', async () => {
    const rejection = buildNotAuthorizedError()
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => callbacks.onFailure(rejection) })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    await expect(srpAuth.authenticate(challengedEmail, 'wrong')).rejects.toBe(rejection)

    expect(() => srpAuth.getPendingUser()).toThrow('No active authentication challenge')
    expect(srpAuth.getActiveEmail()).toBe('')
  })

  it.each([
    ['UserNotConfirmedException', 'unconfirmed_user'],
    ['PasswordResetRequiredException', 'password_reset_required'],
  ])('turns %s into the %s result and clears the pending user', async (errorName, expectedKind) => {
    const failure = new Error('account state')
    failure.name = errorName
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => callbacks.onFailure(failure) })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    const outcome = await srpAuth.authenticate(challengedEmail, 'password-1')

    expect(outcome.signInResult).toEqual({ kind: expectedKind })
    expect(outcome.tokens).toBeUndefined()
    expect(() => srpAuth.getPendingUser()).toThrow('No active authentication challenge')
  })

  it('matches the account state by the sdk code property as well', async () => {
    const failure = Object.assign(new Error('not confirmed'), { code: 'UserNotConfirmedException' })
    failure.name = 'Error'
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => callbacks.onFailure(failure) })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    const outcome = await srpAuth.authenticate(challengedEmail, 'password-1')

    expect(outcome.signInResult).toEqual({ kind: 'unconfirmed_user' })
  })

  it('rejects and clears the pending user when the software token cannot be associated', async () => {
    const rejection = new Error('association failed')
    scriptCognitoUser({
      authenticateUser: (_details, callbacks) => raiseMfaSetupChallenge(callbacks),
      associateSoftwareToken: (callbacks) => callbacks.onFailure(rejection),
    })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)

    await expect(srpAuth.authenticate(challengedEmail, 'password-1')).rejects.toBe(rejection)

    expect(() => srpAuth.getPendingUser()).toThrow('No active authentication challenge')
  })

  it('replaces the previous pending user when a new sign in starts', async () => {
    scriptCognitoUser({ authenticateUser: (_details, callbacks) => raiseTotpChallenge(callbacks) })
    const srpAuth = new CognitoSrpAuth(testCognitoConfig)
    await srpAuth.authenticate('first@example.com', 'password-1')
    const firstPendingUser = srpAuth.getPendingUser()

    await srpAuth.authenticate('second@example.com', 'password-2')

    expect(srpAuth.getActiveEmail()).toBe('second@example.com')
    expect(srpAuth.getPendingUser()).not.toBe(firstPendingUser)
  })
})
