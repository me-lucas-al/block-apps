import {
  AdminAddUserToGroupCommand,
  AdminDeleteUserAttributesCommand,
  AdminRemoveUserFromGroupCommand,
  AdminResetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminUserGlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { UserEditor } from '../../users/contracts/UserEditor'
import type { UserRole } from '../../users/model/AdminUser'
import type { CognitoContext } from './CognitoContext'
import { withTranslatedErrors } from './translateCognitoError'

export class CognitoUserEditor implements UserEditor {
  constructor(private readonly context: CognitoContext) {}

  private buildUserKey(username: string) {
    return { UserPoolId: this.context.userPoolId, Username: username }
  }

  updateDisplayName(username: string, displayName: string | null): Promise<void> {
    return withTranslatedErrors(async () => {
      const userKey = this.buildUserKey(username)
      if (displayName === null) {
        await this.context.client.send(
          new AdminDeleteUserAttributesCommand({ ...userKey, UserAttributeNames: ['name'] }),
        )
        return
      }
      await this.context.client.send(
        new AdminUpdateUserAttributesCommand({
          ...userKey,
          UserAttributes: [{ Name: 'name', Value: displayName }],
        }),
      )
    })
  }

  changeRole(username: string, from: UserRole, to: UserRole): Promise<void> {
    return withTranslatedErrors(async () => {
      const userKey = this.buildUserKey(username)
      const { groupNames } = this.context
      await this.context.client.send(
        new AdminRemoveUserFromGroupCommand({ ...userKey, GroupName: groupNames[from] }),
      )
      await this.context.client.send(
        new AdminAddUserToGroupCommand({ ...userKey, GroupName: groupNames[to] }),
      )
      await this.context.client.send(new AdminUserGlobalSignOutCommand(userKey))
    })
  }

  forcePasswordReset(username: string): Promise<void> {
    return withTranslatedErrors(async () => {
      const userKey = this.buildUserKey(username)
      await this.context.client.send(new AdminResetUserPasswordCommand(userKey))
      await this.context.client.send(new AdminUserGlobalSignOutCommand(userKey))
    })
  }
}
