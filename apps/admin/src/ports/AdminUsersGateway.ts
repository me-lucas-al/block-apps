import type { AdminUser, CreateUserInput, UpdateUserInput } from './userTypes'

export interface AdminUsersGateway {
  list(): Promise<AdminUser[]>
  create(input: CreateUserInput): Promise<AdminUser>
  update(userId: string, input: UpdateUserInput): Promise<AdminUser>
  remove(userId: string): Promise<void>
}
