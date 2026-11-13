import { describe, expect, it } from 'vitest'
import type { UserDirectoryLookup } from '../../src/auth/contracts/UserDirectoryLookup'
import { LinkFederatedUserUseCase } from '../../src/auth/use-cases/LinkFederatedUserUseCase'
import { answerPreSignUpEvent } from '../../src/lambda/answerPreSignUpEvent'
import type { PreSignUpTriggerEvent } from '../../src/lambda/PreSignUpTriggerEvent'

function buildGoogleEvent(): PreSignUpTriggerEvent {
  return {
    triggerSource: 'PreSignUp_ExternalProvider',
    userPoolId: 'pool-1',
    userName: 'Google_123',
    request: { userAttributes: { email: 'user@example.com', email_verified: 'true' } },
    response: {},
  }
}

function buildLinker(nativeUsername: string | null): LinkFederatedUserUseCase {
  const directory: UserDirectoryLookup = {
    findNativeUserByEmail: async () => (nativeUsername ? { username: nativeUsername } : null),
    linkProvider: async () => undefined,
  }
  return new LinkFederatedUserUseCase(directory)
}

describe('answerPreSignUpEvent', () => {
  it('auto confirms a Google user without a native account', async () => {
    const reply = await answerPreSignUpEvent(buildLinker(null), buildGoogleEvent())
    expect(reply.response).toEqual({ autoConfirmUser: true, autoVerifyEmail: true })
  })

  it('rejects the sign up after linking to the native account', async () => {
    await expect(answerPreSignUpEvent(buildLinker('native-1'), buildGoogleEvent())).rejects.toThrow(
      'GOOGLE_ACCOUNT_LINKED_PLEASE_SIGN_IN',
    )
  })
})
