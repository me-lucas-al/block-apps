import { createLinkFederatedUserUseCase } from '../../composition/createLinkFederatedUserUseCase'
import { createLazyHandler } from '../createLazyHandler'
import { answerPreSignUpEvent } from './answerPreSignUpEvent'
import type { PreSignUpTriggerEvent } from './PreSignUpTriggerEvent'

export const preSignUpHandler = createLazyHandler(() => {
  const linkFederatedUser = createLinkFederatedUserUseCase()
  return (event: PreSignUpTriggerEvent) => answerPreSignUpEvent(linkFederatedUser, event)
})
