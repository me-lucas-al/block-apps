import type { HttpAdminUsersGateway } from '@block-apps/api'
import type { AdminUsersGateway } from '../ports/AdminUsersGateway'
import type { AdminUser, CreateUserInput, UpdateUserInput } from '../ports/userTypes'

export class HttpAdminUsersAdapter implements AdminUsersGateway {
  constructor(private readonly gateway: HttpAdminUsersGateway) {}

  async list(): Promise<AdminUser[]> {
    const users = await this.gateway.listUsers()
    return [...users]
  }

  async create(input: CreateUserInput): Promise<AdminUser> {
    return this.gateway.createUser(input)
  }

  async update(userId: string, input: UpdateUserInput): Promise<AdminUser> {
    return this.gateway.updateUser(userId, input)
  }

  async remove(userId: string): Promise<void> {
    await this.gateway.deleteUser(userId)
  }
}
