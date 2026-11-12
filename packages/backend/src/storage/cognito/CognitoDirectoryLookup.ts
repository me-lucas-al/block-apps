import {
  AdminLinkProviderForUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
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
        Filter: `email = "${email}"`,
        Limit: 5,
      }),
    )
    const users = reply.Users ?? []
    const native = users.find(
      (user) => user.UserStatus !== 'EXTERNAL_PROVIDER' && user.Username && !user.Username.includes('_'),
    )
    return native?.Username ? { username: native.Username } : null
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
