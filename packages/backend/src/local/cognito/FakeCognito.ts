import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminResetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminUserGlobalSignOutCommand,
  ListUsersCommand,
  ListUsersInGroupCommand,
  type CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import type { CognitoContext } from '../../storage/cognito/CognitoContext'
import {
  buildCognitoError,
  listUsersResponse,
  paginateUsers,
  toCognitoRecord,
  type FakeCognitoUser,
} from './fakeCognitoRecords'

type FakeInput = Record<string, string | undefined> & { UserAttributes?: { Name: string; Value: string }[] }

export class FakeCognito {
  readonly users = new Map<string, FakeCognitoUser>()
  readonly signedOut: string[] = []
  readonly failingCommands = new Set<string>()
  private nextNumber = 1

  addUser(user: Partial<FakeCognitoUser> & { sub: string; email: string }): void {
    const username = user.username ?? user.sub
    this.users.set(username, { username, enabled: true, status: 'CONFIRMED', groups: new Set(), ...user })
  }

  private findUserOrFail(username: string): FakeCognitoUser {
    const user = this.users.get(username)
    if (!user) throw buildCognitoError('UserNotFoundException')
    return user
  }

  private readonly send = async (command: object): Promise<object> => {
    if (this.failingCommands.has(command.constructor.name)) throw new Error('injected failure')
    const input = (command as { input: FakeInput }).input
    const username = input['Username'] ?? ''
    const groupName = input['GroupName'] ?? ''
    if (command instanceof AdminCreateUserCommand) return this.createUser(input)
    if (command instanceof AdminGetUserCommand) return toCognitoRecord(this.findUserOrFail(username))
    if (command instanceof AdminListGroupsForUserCommand) {
      return { Groups: [...this.findUserOrFail(username).groups].map((GroupName) => ({ GroupName })) }
    }
    if (command instanceof ListUsersCommand) return listUsersResponse([...this.users.values()], input)
    if (command instanceof ListUsersInGroupCommand) {
      const members = [...this.users.values()].filter((user) => user.groups.has(groupName))
      const page = paginateUsers(members, input['NextToken'])
      return { Users: page.users, NextToken: page.next }
    }
    if (command instanceof AdminAddUserToGroupCommand) this.findUserOrFail(username).groups.add(groupName)
    if (command instanceof AdminRemoveUserFromGroupCommand) this.findUserOrFail(username).groups.delete(groupName)
    if (command instanceof AdminUpdateUserAttributesCommand) {
      this.findUserOrFail(username).name = input.UserAttributes?.[0]?.Value
    }
    if (command instanceof AdminDeleteUserAttributesCommand) delete this.findUserOrFail(username).name
    if (command instanceof AdminResetUserPasswordCommand) this.resetPassword(username)
    if (command instanceof AdminUserGlobalSignOutCommand) this.signedOut.push(this.findUserOrFail(username).sub)
    if (command instanceof AdminDeleteUserCommand) this.users.delete(this.findUserOrFail(username).username)
    return {}
  }

  private resetPassword(username: string): void {
    const user = this.findUserOrFail(username)
    if (user.status !== 'CONFIRMED') throw buildCognitoError('InvalidParameterException')
    user.status = 'RESET_REQUIRED'
  }

  private createUser(input: FakeInput) {
    const attributes = input.UserAttributes ?? []
    const email = attributes.find((attribute) => attribute.Name === 'email')?.Value ?? ''
    if ([...this.users.values()].some((user) => user.email === email)) {
      throw buildCognitoError('UsernameExistsException')
    }
    const name = attributes.find((attribute) => attribute.Name === 'name')?.Value
    const sub = `00000000-0000-4000-8000-${String(this.nextNumber++).padStart(12, '0')}`
    this.addUser({ sub, email, name, status: 'FORCE_CHANGE_PASSWORD' })
    return { User: toCognitoRecord(this.findUserOrFail(sub)) }
  }

  asContext(): CognitoContext {
    return {
      client: { send: this.send } as unknown as CognitoIdentityProviderClient,
      userPoolId: 'pool-1',
      groupNames: { admin: 'admin', user: 'user' },
    }
  }
}
