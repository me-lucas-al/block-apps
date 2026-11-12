import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminResetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminUserGlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { ConflictError } from '../../domain/errors/ConflictError'
import type { NewDirectoryUser, UserWriter } from '../../users/contracts/UserWriter'
import type { UserRole } from '../../users/model/AdminUser'
import type { DirectoryUser } from '../../users/model/DirectoryUser'
import type { CognitoContext } from './CognitoContext'
import { isCognitoError } from './isCognitoError'
import { mapDirectoryUser } from './mapDirectoryUser'

export class CognitoUserWriter implements UserWriter {
  constructor(private readonly context: CognitoContext) {}

  private identify(userId: string) {
    return { UserPoolId: this.context.userPoolId, Username: userId }
  }

  async create(newUser: NewDirectoryUser): Promise<DirectoryUser> {
    const attributes = [
      { Name: 'email', Value: newUser.email },
      { Name: 'email_verified', Value: 'true' },
      ...(newUser.displayName ? [{ Name: 'name', Value: newUser.displayName }] : []),
    ]
    try {
      const { User } = await this.context.client.send(
        new AdminCreateUserCommand({
          UserPoolId: this.context.userPoolId,
          Username: newUser.email,
          UserAttributes: attributes,
          DesiredDeliveryMediums: ['EMAIL'],
        }),
      )
      await this.joinGroupOrRollback(User?.Username ?? '', newUser.role)
      return mapDirectoryUser(User ?? {}, newUser.role)
    } catch (error: unknown) {
      if (isCognitoError(error, 'UsernameExistsException')) {
        throw new ConflictError('a user with this email already exists')
      }
      throw error
    }
  }

  private async joinGroupOrRollback(userId: string, role: UserRole): Promise<void> {
    try {
      await this.context.client.send(
        new AdminAddUserToGroupCommand({ ...this.identify(userId), GroupName: this.context.groupNames[role] }),
      )
    } catch (error: unknown) {
      await this.context.client.send(new AdminDeleteUserCommand(this.identify(userId)))
      throw error
    }
  }

  async updateDisplayName(userId: string, displayName: string | null): Promise<void> {
    if (displayName === null) {
      await this.context.client.send(
        new AdminDeleteUserAttributesCommand({ ...this.identify(userId), UserAttributeNames: ['name'] }),
      )
      return
    }
    await this.context.client.send(
      new AdminUpdateUserAttributesCommand({
        ...this.identify(userId),
        UserAttributes: [{ Name: 'name', Value: displayName }],
      }),
    )
  }

  async changeRole(userId: string, from: UserRole, to: UserRole): Promise<void> {
    const { groupNames } = this.context
    await this.context.client.send(
      new AdminAddUserToGroupCommand({ ...this.identify(userId), GroupName: groupNames[to] }),
    )
    await this.context.client.send(
      new AdminRemoveUserFromGroupCommand({ ...this.identify(userId), GroupName: groupNames[from] }),
    )
    await this.signOutEverywhere(userId)
  }

  async forcePasswordReset(userId: string): Promise<void> {
    await this.context.client.send(new AdminResetUserPasswordCommand(this.identify(userId)))
    await this.signOutEverywhere(userId)
  }

  async remove(userId: string): Promise<void> {
    await this.context.client.send(new AdminDeleteUserCommand(this.identify(userId)))
  }

  private async signOutEverywhere(userId: string): Promise<void> {
    await this.context.client.send(new AdminUserGlobalSignOutCommand(this.identify(userId)))
  }
}
