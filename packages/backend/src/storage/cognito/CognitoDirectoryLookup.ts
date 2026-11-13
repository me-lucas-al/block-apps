import {
  AdminLinkProviderForUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { buildEmailFilter, findLinkableNativeUser } from './findLinkableNativeUser'
import type {
  ProviderLinkRequest,
  UserDirectoryLookup,
} from '../../auth/contracts/UserDirectoryLookup'

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

  async linkProvider(request: ProviderLinkRequest): Promise<void> {
    await this.client.send(
      new AdminLinkProviderForUserCommand({
        UserPoolId: request.userPoolId,
        DestinationUser: {
          ProviderName: 'Cognito',
          ProviderAttributeValue: request.destinationUsername,
        },
        SourceUser: {
          ProviderName: request.providerName,
          ProviderAttributeName: 'Cognito_Subject',
          ProviderAttributeValue: request.providerUserId,
        },
      }),
    )
  }
}
