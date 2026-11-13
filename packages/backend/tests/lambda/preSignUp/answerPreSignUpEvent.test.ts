import { describe, expect, it } from 'vitest'
import type { UserDirectoryLookup } from '../../../src/auth/contracts/UserDirectoryLookup'
import { LinkFederatedUserUseCase } from '../../../src/auth/use-cases/LinkFederatedUserUseCase'
import { answerPreSignUpEvent } from '../../../src/lambda/preSignUp/answerPreSignUpEvent'
import type { PreSignUpTriggerEvent } from '../../../src/lambda/preSignUp/PreSignUpTriggerEvent'

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

  it('returns the event untouched for a regular sign up', async () => {
    const event = { ...buildGoogleEvent(), triggerSource: 'PreSignUp_SignUp' }
    const reply = await answerPreSignUpEvent(buildLinker('native-1'), event)
    expect(reply).toBe(event)
    expect(reply.response).toEqual({})
  })

  it('returns the event untouched when the email is not verified', async () => {
    const event = buildGoogleEvent()
    event.request.userAttributes['email_verified'] = 'false'
    const reply = await answerPreSignUpEvent(buildLinker('native-1'), event)
    expect(reply).toBe(event)
    expect(reply.response).toEqual({})
  })

  it('rejects the sign up after linking to the native account', async () => {
    await expect(answerPreSignUpEvent(buildLinker('native-1'), buildGoogleEvent())).rejects.toThrow(
      'GOOGLE_ACCOUNT_LINKED_PLEASE_SIGN_IN',
    )
  })
})
