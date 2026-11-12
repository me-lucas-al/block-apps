import {
  AdminLinkProviderForUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { buildEmailFilter, findLinkableNativeUser } from './findLinkableNativeUser'
import type { UserDirectoryLookup } from '../../auth/use-cases/LinkFederatedUserUseCase'

export class CognitoDirectoryLookup implements UserDirectoryLookup {
  constructor(private readonly client: CognitoIdentityProviderClient) {}

  async findNativeUserByEmail(
    userPoolId: string,
    email: string,
  ): Promise<{ username: string } | null> {
    const reply = await this.client.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: buildEmailFilter(email),
        Limit: 5,
      }),
    )
    return findLinkableNativeUser(reply.Users ?? [])
  }

  async linkProvider(input: {
    userPoolId: string
    destinationUsername: string
    providerName: string
    providerUserId: string
  }): Promise<void> {
    await this.client.send(
      new AdminLinkProviderForUserCommand({
        UserPoolId: input.userPoolId,
        DestinationUser: {
          ProviderName: 'Cognito',
          ProviderAttributeValue: input.destinationUsername,
        },
        SourceUser: {
          ProviderName: input.providerName,
          ProviderAttributeName: 'Cognito_Subject',
          ProviderAttributeValue: input.providerUserId,
        },
      }),
    )
  }
}
