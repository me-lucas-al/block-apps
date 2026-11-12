import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { CognitoDirectoryLookup } from '../storage/cognito/CognitoDirectoryLookup'
import { LinkFederatedUserUseCase } from '../auth/use-cases/LinkFederatedUserUseCase'

export type PreSignUpTriggerEvent = {
  triggerSource: string
  userPoolId: string
  userName: string
  request: {
    userAttributes: Record<string, string | undefined>
  }
  response: {
    autoConfirmUser?: boolean
    autoVerifyEmail?: boolean
  }
}

let cachedUseCase: LinkFederatedUserUseCase | undefined

function getUseCase(): LinkFederatedUserUseCase {
  cachedUseCase ??= new LinkFederatedUserUseCase(
    new CognitoDirectoryLookup(new CognitoIdentityProviderClient({})),
  )
  return cachedUseCase
}

export async function preSignUpHandler(
  event: PreSignUpTriggerEvent,
): Promise<PreSignUpTriggerEvent> {
  const email = event.request.userAttributes['email']
  const emailVerified = event.request.userAttributes['email_verified'] === 'true'
  await getUseCase().link({
    triggerSource: event.triggerSource,
    userPoolId: event.userPoolId,
    userName: event.userName,
    email,
    emailVerified,
  })
  return event
}
