import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { NewDirectoryUser, UserCreator } from '../../users/contracts/UserCreator'
import type { UserRole } from '../../users/model/AdminUser'
import type { DirectoryUser } from '../../users/model/DirectoryUser'
import type { CognitoContext } from './CognitoContext'
import { mapDirectoryUser } from './mapDirectoryUser'
import { withTranslatedErrors } from './translateCognitoError'

export class CognitoUserCreator implements UserCreator {
  constructor(private readonly context: CognitoContext) {}

  create(newUser: NewDirectoryUser): Promise<DirectoryUser> {
    return withTranslatedErrors(async () => {
      const attributes = [
        { Name: 'email', Value: newUser.email },
        { Name: 'email_verified', Value: 'true' },
        ...(newUser.displayName ? [{ Name: 'name', Value: newUser.displayName }] : []),
      ]
      const { User } = await this.context.client.send(
        new AdminCreateUserCommand({
          UserPoolId: this.context.userPoolId,
          Username: newUser.email,
          UserAttributes: attributes,
          DesiredDeliveryMediums: ['EMAIL'],
        }),
      )
      if (!User?.Username) throw new Error('Cognito returned no user for the new account')
      await this.joinGroupOrRollback(User.Username, newUser.role)
      return mapDirectoryUser(User, newUser.role)
    })
  }

  private async joinGroupOrRollback(username: string, role: UserRole): Promise<void> {
    const user = { UserPoolId: this.context.userPoolId, Username: username }
    try {
      await this.context.client.send(
        new AdminAddUserToGroupCommand({ ...user, GroupName: this.context.groupNames[role] }),
      )
    } catch (error: unknown) {
      await this.context.client.send(new AdminDeleteUserCommand(user)).catch(() => {
        console.error(JSON.stringify({ message: 'could not undo user creation', username }))
      })
      throw error
    }
  }
}
