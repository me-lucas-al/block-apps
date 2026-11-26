import type { CognitoUser } from 'amazon-cognito-identity-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildCognitoSession, signedInTokens } from '../../helpers/cognito/buildCognitoSession'
import { resetCognitoUserScript, scriptCognitoUser } from '../../helpers/cognito/FakeCognitoUser'
import {
  challengedEmail,
  raiseTotpChallenge,
  startPendingChallenge,
} from '../../helpers/cognito/startPendingChallenge'

vi.mock('amazon-cognito-identity-js', async () => {
  const { buildCognitoSdkModuleDouble } = await import('../../helpers/cognito/cognitoSdkModuleDouble')
  return buildCognitoSdkModuleDouble()
})

describe('CognitoChallengeResolver.sendTotpCode', () => {
  afterEach(resetCognitoUserScript)

  it('sends the code as a software token and returns the session tokens', async () => {
    const respondToMfaCode = vi.fn<CognitoUser['sendMFACode']>((_code, callbacks) =>
      callbacks.onSuccess(buildCognitoSession()),
    )
    const { srpAuth, challengeResolver } = await startPendingChallenge(raiseTotpChallenge)
    scriptCognitoUser({ sendMFACode: respondToMfaCode })

    const tokens = await challengeResolver.sendTotpCode('123456')

    expect(respondToMfaCode).toHaveBeenCalledWith('123456', expect.anything(), 'SOFTWARE_TOKEN_MFA')
    expect(tokens).toEqual({ ...signedInTokens, email: challengedEmail })
    expect(() => srpAuth.getPendingUser()).toThrow('No active authentication challenge')
  })

  it('rejects with the original error and keeps the pending user for a retry', async () => {
    const rejection = new Error('Code mismatch')
    const { srpAuth, challengeResolver } = await startPendingChallenge(raiseTotpChallenge)
    scriptCognitoUser({ sendMFACode: (_code, callbacks) => callbacks.onFailure(rejection) })

    await expect(challengeResolver.sendTotpCode('000000')).rejects.toBe(rejection)

    expect(() => srpAuth.getPendingUser()).not.toThrow()
  })

  it('throws synchronously when there is no pending challenge', async () => {
    const { srpAuth, challengeResolver } = await startPendingChallenge(raiseTotpChallenge)
    srpAuth.clearPendingUser()

    expect(() => challengeResolver.sendTotpCode('123456')).toThrow('No active authentication challenge')
  })
})
