import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { LinkFederatedUserUseCase } from '../auth/use-cases/LinkFederatedUserUseCase'
import { CognitoDirectoryLookup } from '../storage/cognito/CognitoDirectoryLookup'

export function createLinkFederatedUserUseCase(): LinkFederatedUserUseCase {
  return new LinkFederatedUserUseCase(
    new CognitoDirectoryLookup(new CognitoIdentityProviderClient({})),
  )
}
