import type { AdminUser, CreateUserInput, UpdateUserInput } from '@block-apps/core'

export interface AdminUsersGateway {
  listUsers(): Promise<readonly AdminUser[]>
  createUser(input: CreateUserInput): Promise<AdminUser>
  updateUser(userId: string, changes: UpdateUserInput): Promise<AdminUser>
  deleteUser(userId: string): Promise<void>
}
