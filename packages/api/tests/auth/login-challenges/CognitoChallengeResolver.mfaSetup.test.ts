import type { CognitoUser } from 'amazon-cognito-identity-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildCognitoSession } from '../../helpers/cognito/buildCognitoSession'
import { resetCognitoUserScript, scriptCognitoUser } from '../../helpers/cognito/FakeCognitoUser'
import { raiseMfaSetupChallenge } from '../../helpers/cognito/signInChallengeRaisers'
import { startPendingChallenge } from '../../helpers/cognito/startPendingChallenge'

vi.mock('amazon-cognito-identity-js', async () => {
  const { buildCognitoSdkModuleDouble } = await import('../../helpers/cognito/cognitoSdkModuleDouble')
  return buildCognitoSdkModuleDouble()
})

async function startMfaSetupChallenge() {
  scriptCognitoUser({
    associateSoftwareToken: (callbacks) => callbacks.associateSecretCode('SECRET-CODE'),
  })
  return startPendingChallenge(raiseMfaSetupChallenge)
}

describe('CognitoChallengeResolver.verifyMfaSetup', () => {
  afterEach(resetCognitoUserScript)

  it('verifies the code and then enables software token mfa as preferred', async () => {
    const verifyTotpCode = vi.fn<CognitoUser['verifySoftwareToken']>((_code, _deviceName, callbacks) =>
      callbacks.onSuccess(buildCognitoSession()),
    )
    const enableMfaPreference = vi.fn<CognitoUser['setUserMfaPreference']>(
      (_smsSettings, _softwareTokenSettings, callback) => callback(undefined, 'SUCCESS'),
    )
    const { challengeResolver } = await startMfaSetupChallenge()
    scriptCognitoUser({
      verifySoftwareToken: verifyTotpCode,
      setUserMfaPreference: enableMfaPreference,
    })

    await expect(challengeResolver.verifyMfaSetup('123456')).resolves.toBeUndefined()

    expect(verifyTotpCode).toHaveBeenCalledWith('123456', 'authenticator', expect.anything())
    expect(enableMfaPreference).toHaveBeenCalledWith(
      null,
      { PreferredMfa: true, Enabled: true },
      expect.any(Function),
    )
  })

  it('rejects with the original error and skips the preference when verification fails', async () => {
    const rejection = new Error('Code mismatch')
    const enableMfaPreference = vi.fn<CognitoUser['setUserMfaPreference']>()
    const { challengeResolver } = await startMfaSetupChallenge()
    scriptCognitoUser({
      verifySoftwareToken: (_code, _deviceName, callbacks) => callbacks.onFailure(rejection),
      setUserMfaPreference: enableMfaPreference,
    })

    await expect(challengeResolver.verifyMfaSetup('000000')).rejects.toBe(rejection)

    expect(enableMfaPreference).not.toHaveBeenCalled()
  })

  it('rejects with the preference error when enabling mfa fails', async () => {
    const rejection = new Error('preference rejected')
    const { challengeResolver } = await startMfaSetupChallenge()
    scriptCognitoUser({
      verifySoftwareToken: (_code, _deviceName, callbacks) => callbacks.onSuccess(buildCognitoSession()),
      setUserMfaPreference: (_smsSettings, _softwareTokenSettings, callback) => callback(rejection),
    })

    await expect(challengeResolver.verifyMfaSetup('123456')).rejects.toBe(rejection)
  })

  it('keeps the pending user after a successful setup', async () => {
    const { srpAuth, challengeResolver } = await startMfaSetupChallenge()
    scriptCognitoUser({
      verifySoftwareToken: (_code, _deviceName, callbacks) => callbacks.onSuccess(buildCognitoSession()),
      setUserMfaPreference: (_smsSettings, _softwareTokenSettings, callback) => callback(undefined, 'SUCCESS'),
    })

    await challengeResolver.verifyMfaSetup('123456')

    expect(() => srpAuth.getPendingUser()).not.toThrow()
  })

  it('throws synchronously when there is no pending challenge', async () => {
    const { srpAuth, challengeResolver } = await startMfaSetupChallenge()
    srpAuth.clearPendingUser()

    expect(() => challengeResolver.verifyMfaSetup('123456')).toThrow('No active authentication challenge')
  })
})
