import type { CognitoUser } from 'amazon-cognito-identity-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildCognitoSession, signedInTokens } from '../../helpers/cognito/buildCognitoSession'
import { resetCognitoUserScript, scriptCognitoUser } from '../../helpers/cognito/FakeCognitoUser'
import { challengedEmail } from '../../helpers/cognito/cognitoTestFixtures'
import { raiseNewPasswordChallenge } from '../../helpers/cognito/signInChallengeRaisers'
import { startPendingChallenge } from '../../helpers/cognito/startPendingChallenge'

vi.mock('amazon-cognito-identity-js', async () => {
  const { buildCognitoSdkModuleDouble } = await import('../../helpers/cognito/cognitoSdkModuleDouble')
  return buildCognitoSdkModuleDouble()
})

describe('CognitoChallengeResolver.completeNewPassword', () => {
  afterEach(resetCognitoUserScript)

  it('responds with the new password and returns the session tokens', async () => {
    const respondToNewPassword = vi.fn<CognitoUser['completeNewPasswordChallenge']>(
      (_newPassword, _requiredAttributes, callbacks) => callbacks.onSuccess(buildCognitoSession()),
    )
    const { srpAuth, challengeResolver } = await startPendingChallenge(raiseNewPasswordChallenge)
    scriptCognitoUser({ completeNewPasswordChallenge: respondToNewPassword })

    const tokens = await challengeResolver.completeNewPassword('N3w-passw0rd!')

    expect(respondToNewPassword).toHaveBeenCalledWith('N3w-passw0rd!', {}, expect.anything())
    expect(tokens).toEqual({ ...signedInTokens, email: challengedEmail })
    expect(() => srpAuth.getPendingUser()).toThrow('No active authentication challenge')
  })

  it('rejects with the original error and keeps the pending user for a retry', async () => {
    const rejection = new Error('password does not meet the policy')
    const { srpAuth, challengeResolver } = await startPendingChallenge(raiseNewPasswordChallenge)
    scriptCognitoUser({
      completeNewPasswordChallenge: (_newPassword, _requiredAttributes, callbacks) =>
        callbacks.onFailure(rejection),
    })

    await expect(challengeResolver.completeNewPassword('weak')).rejects.toBe(rejection)

    expect(() => srpAuth.getPendingUser()).not.toThrow()
  })

  it('throws synchronously when there is no pending challenge', async () => {
    const { srpAuth, challengeResolver } = await startPendingChallenge(raiseNewPasswordChallenge)
    srpAuth.clearPendingUser()

    expect(() => challengeResolver.completeNewPassword('N3w-passw0rd!')).toThrow(
      'No active authentication challenge',
    )
  })
})
