import type { AdminUser } from './adminUser.ts'
import type { CreateUserInput, UpdateUserInput } from './userInputs.ts'

export interface UserDirectory {
  find(userId: string): Promise<AdminUser | null>
  list(): Promise<AdminUser[]>
  countAdmins(): Promise<number>
  create(newUser: CreateUserInput): Promise<AdminUser>
  update(userId: string, changes: UpdateUserInput): Promise<AdminUser>
  remove(userId: string): Promise<void>
}
