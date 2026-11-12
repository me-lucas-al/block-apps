import type { AdminUser, CreateUserInput, UpdateUserInput } from '@block-apps/core'
import type { AdminUsersGateway } from '../../contracts/AdminUsersGateway'
import type { HttpApiClient } from '../../../http/client/HttpApiClient'

export class HttpAdminUsersGateway implements AdminUsersGateway {
  constructor(private readonly http: HttpApiClient) {}

  async listUsers(): Promise<readonly AdminUser[]> {
    return this.http.get<readonly AdminUser[]>('/admin/users')
  }

  async createUser(input: CreateUserInput): Promise<AdminUser> {
    return this.http.post<AdminUser>('/admin/users', input)
  }

  async updateUser(userId: string, changes: UpdateUserInput): Promise<AdminUser> {
    return this.http.patch<AdminUser>(`/admin/users/${encodeURIComponent(userId)}`, changes)
  }

  async deleteUser(userId: string): Promise<void> {
    await this.http.delete<void>(`/admin/users/${encodeURIComponent(userId)}`)
  }
}
