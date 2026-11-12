import {
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { UserReader } from '../../users/contracts/UserReader'
import type { DirectoryUser } from '../../users/model/DirectoryUser'
import type { CognitoContext } from './CognitoContext'
import { isCognitoError } from './isCognitoError'
import { listAdminUsers, listAllUsers } from './listUserPages'
import { mapDirectoryUser } from './mapDirectoryUser'

export class CognitoUserReader implements UserReader {
  constructor(private readonly context: CognitoContext) {}

  async find(userId: string): Promise<DirectoryUser | null> {
    const request = { UserPoolId: this.context.userPoolId, Username: userId }
    try {
      const record = await this.context.client.send(new AdminGetUserCommand(request))
      const { Groups } = await this.context.client.send(new AdminListGroupsForUserCommand(request))
      const isAdmin = (Groups ?? []).some((group) => group.GroupName === this.context.groupNames.admin)
      return mapDirectoryUser(record, isAdmin ? 'admin' : 'user')
    } catch (error: unknown) {
      if (isCognitoError(error, 'UserNotFoundException')) return null
      throw error
    }
  }

  async list(): Promise<DirectoryUser[]> {
    const [users, admins] = await Promise.all([listAllUsers(this.context), listAdminUsers(this.context)])
    const adminIds = new Set(admins.map((admin) => admin.Username))
    return users.map((user) => mapDirectoryUser(user, adminIds.has(user.Username) ? 'admin' : 'user'))
  }

  async countAdmins(): Promise<number> {
    const admins = await listAdminUsers(this.context)
    return admins.filter((admin) => admin.Enabled).length
  }
}
