import {
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { UserReader } from '../../users/contracts/UserReader'
import type { DirectoryUser } from '../../users/model/DirectoryUser'
import { isUsableAdmin } from '../../users/model/isUsableAdmin'
import type { CognitoContext } from './CognitoContext'
import { isCognitoError } from './isCognitoError'
import { listAdminGroupMembers, listAllPoolUsers } from './listUserPages'
import { mapDirectoryUser, readCognitoAttribute, type CognitoUserRecord } from './mapDirectoryUser'

export class CognitoUserReader implements UserReader {
  constructor(private readonly context: CognitoContext) {}

  async find(userId: string): Promise<DirectoryUser | null> {
    const record = await this.findRecordBySub(userId)
    if (!record?.Username) return null
    const { Groups } = await this.context.client.send(
      new AdminListGroupsForUserCommand({ UserPoolId: this.context.userPoolId, Username: record.Username }),
    )
    const isAdmin = (Groups ?? []).some((group) => group.GroupName === this.context.groupNames.admin)
    return mapDirectoryUser(record, isAdmin ? 'admin' : 'user')
  }

  async list(): Promise<DirectoryUser[]> {
    const [users, admins] = await Promise.all([
      listAllPoolUsers(this.context),
      listAdminGroupMembers(this.context),
    ])
    const adminUsernames = new Set(admins.map((admin) => admin.Username))
    return users.map((user) => mapDirectoryUser(user, adminUsernames.has(user.Username) ? 'admin' : 'user'))
  }

  async countAdmins(): Promise<number> {
    const admins = await listAdminGroupMembers(this.context)
    return admins.filter((admin) => isUsableAdmin(mapDirectoryUser(admin, 'admin'))).length
  }

  private async findRecordBySub(userId: string): Promise<CognitoUserRecord | null> {
    const directRecord = await this.getByUsername(userId)
    if (directRecord && readCognitoAttribute(directRecord, 'sub') === userId) return directRecord
    const { Users } = await this.context.client.send(
      new ListUsersCommand({ UserPoolId: this.context.userPoolId, Filter: `sub = "${userId}"`, Limit: 1 }),
    )
    const username = Users?.[0]?.Username
    return username ? this.getByUsername(username) : null
  }

  private async getByUsername(username: string): Promise<CognitoUserRecord | null> {
    try {
      return await this.context.client.send(
        new AdminGetUserCommand({ UserPoolId: this.context.userPoolId, Username: username }),
      )
    } catch (error: unknown) {
      if (isCognitoError(error, 'UserNotFoundException')) return null
      throw error
    }
  }
}
