import { AdminError } from '../../../../supabase/functions/_shared/admin-users/AdminError.ts'
import type {
  AdminUser,
  CreateUserInput,
  UpdateUserInput,
  UserDirectory,
} from '../../../../supabase/functions/_shared/admin-users/types.ts'

export class InMemoryUserDirectory implements UserDirectory {
  private readonly users = new Map<string, AdminUser>()
  private nextId = 1

  seed(user: Partial<AdminUser> & Pick<AdminUser, 'email' | 'role'>): AdminUser {
    const created: AdminUser = {
      id: `user-${this.nextId++}`,
      displayName: null,
      cooldownHours: 24,
      mustChangePassword: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      lastSignInAt: null,
      ...user,
    }
    this.users.set(created.id, created)
    return created
  }

  async find(userId: string): Promise<AdminUser | null> {
    return this.users.get(userId) ?? null
  }

  async list(): Promise<AdminUser[]> {
    return [...this.users.values()]
  }

  async create(input: CreateUserInput): Promise<AdminUser> {
    const { password: _password, ...profile } = input
    const duplicate = [...this.users.values()].some((user) => user.email === input.email)
    if (duplicate) throw new AdminError('conflict', 'email already registered')
    return this.seed(profile)
  }

  async update(userId: string, input: UpdateUserInput): Promise<AdminUser> {
    const current = this.users.get(userId)
    if (!current) throw new AdminError('not_found', 'user not found')
    const { password: _password, ...changes } = input
    const updated = { ...current, ...changes }
    this.users.set(userId, updated)
    return updated
  }

  async remove(userId: string): Promise<void> {
    this.users.delete(userId)
  }
}
