import { afterEach, describe, expect, it, vi } from 'vitest'
import { CognitoSrpAuth } from '../../../src/auth/cognito/CognitoSrpAuth'
import { resetCognitoUserScript, scriptCognitoUser } from '../../helpers/cognito/FakeCognitoUser'
import {
  challengedEmail,
  raiseTotpChallenge,
  testCognitoConfig,
} from '../../helpers/cognito/startPendingChallenge'

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

  it('rejects and clears the pending user when the software token cannot be associated', async () => {
    const rejection = new Error('association failed')
    scriptCognitoUser({
      authenticateUser: (_details, callbacks) => callbacks.mfaSetup?.('MFA_SETUP', {}),
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

    await srpAuth.authenticate('second@example.com', 'password-2')

    expect(srpAuth.getActiveEmail()).toBe('second@example.com')
  })
})
