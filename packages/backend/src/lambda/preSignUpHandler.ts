import { createLinkFederatedUserUseCase } from '../composition/createLinkFederatedUserUseCase'
import { answerPreSignUpEvent } from './answerPreSignUpEvent'
import { createLazyHandler } from './createLazyHandler'
import type { PreSignUpTriggerEvent } from './PreSignUpTriggerEvent'

export const preSignUpHandler = createLazyHandler(() => {
  const linkFederatedUser = createLinkFederatedUserUseCase()
  return (event: PreSignUpTriggerEvent) => answerPreSignUpEvent(linkFederatedUser, event)
})
