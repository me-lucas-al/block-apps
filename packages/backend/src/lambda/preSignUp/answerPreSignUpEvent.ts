import type { LinkFederatedUserUseCase } from '../../auth/use-cases/LinkFederatedUserUseCase'
import type { PreSignUpTriggerEvent } from './PreSignUpTriggerEvent'

export async function answerPreSignUpEvent(
  linkFederatedUser: LinkFederatedUserUseCase,
  event: PreSignUpTriggerEvent,
): Promise<PreSignUpTriggerEvent> {
  const outcome = await linkFederatedUser.link({
    triggerSource: event.triggerSource,
    userPoolId: event.userPoolId,
    userName: event.userName,
    email: event.request.userAttributes['email'],
    emailVerified: event.request.userAttributes['email_verified'] === 'true',
  })
  if (outcome.linked) {
    throw new Error('GOOGLE_ACCOUNT_LINKED_PLEASE_SIGN_IN')
  }
  if (outcome.autoConfirm) {
    event.response.autoConfirmUser = true
    event.response.autoVerifyEmail = true
  }
  return event
}
