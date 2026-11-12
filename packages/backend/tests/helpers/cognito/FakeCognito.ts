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
import type { CognitoContext } from '../../../src/storage/cognito/CognitoContext'

export type FakeCognitoUser = {
  id: string
  email: string
  name?: string
  enabled: boolean
  status: string
  groups: Set<string>
}

function failure(errorName: string): Error {
  return Object.assign(new Error(errorName), { name: errorName })
}

function toRecord(user: FakeCognitoUser) {
  const attributes = [{ Name: 'email', Value: user.email }]
  if (user.name) attributes.push({ Name: 'name', Value: user.name })
  return {
    Username: user.id,
    Attributes: attributes,
    UserAttributes: attributes,
    Enabled: user.enabled,
    UserStatus: user.status,
    UserCreateDate: new Date('2026-01-01T00:00:00.000Z'),
  }
}

export class FakeCognito {
  readonly users = new Map<string, FakeCognitoUser>()
  readonly signedOut: string[] = []
  private nextId = 1

  addUser(user: Partial<FakeCognitoUser> & { id: string; email: string }): void {
    this.users.set(user.id, { enabled: true, status: 'CONFIRMED', groups: new Set(), ...user })
  }

  private require(userId: string): FakeCognitoUser {
    const user = this.users.get(userId)
    if (!user) throw failure('UserNotFoundException')
    return user
  }

  private readonly send = async (command: object): Promise<object> => {
    const input = (command as { input: Record<string, never> }).input
    const username: string = input['Username'] ?? ''
    if (command instanceof AdminCreateUserCommand) return this.createUser(command.input)
    if (command instanceof AdminGetUserCommand) return toRecord(this.require(username))
    if (command instanceof AdminListGroupsForUserCommand) {
      return { Groups: [...this.require(username).groups].map((GroupName) => ({ GroupName })) }
    }
    if (command instanceof ListUsersCommand) return { Users: [...this.users.values()].map(toRecord) }
    if (command instanceof ListUsersInGroupCommand) {
      const members = [...this.users.values()].filter((user) => user.groups.has(String(input['GroupName'])))
      return { Users: members.map(toRecord) }
    }
    if (command instanceof AdminAddUserToGroupCommand) this.require(username).groups.add(String(input['GroupName']))
    if (command instanceof AdminRemoveUserFromGroupCommand) this.require(username).groups.delete(String(input['GroupName']))
    if (command instanceof AdminUpdateUserAttributesCommand) this.require(username).name = command.input.UserAttributes?.[0]?.Value
    if (command instanceof AdminDeleteUserAttributesCommand) delete this.require(username).name
    if (command instanceof AdminResetUserPasswordCommand) this.require(username).status = 'RESET_REQUIRED'
    if (command instanceof AdminUserGlobalSignOutCommand) this.signedOut.push(this.require(username).id)
    if (command instanceof AdminDeleteUserCommand) this.users.delete(this.require(username).id)
    return {}
  }

  private createUser(input: AdminCreateUserCommand['input']) {
    const email = input.UserAttributes?.find((attribute) => attribute.Name === 'email')?.Value ?? ''
    if ([...this.users.values()].some((user) => user.email === email)) throw failure('UsernameExistsException')
    const name = input.UserAttributes?.find((attribute) => attribute.Name === 'name')?.Value
    const id = `generated-${this.nextId++}`
    this.addUser({ id, email, name, status: 'FORCE_CHANGE_PASSWORD' })
    return { User: toRecord(this.require(id)) }
  }

  asContext(): CognitoContext {
    return {
      client: { send: this.send } as unknown as CognitoIdentityProviderClient,
      userPoolId: 'pool-1',
      groupNames: { admin: 'admin', user: 'user' },
    }
  }
}
