import { AdminError } from '../../../../supabase/functions/_shared/admin-users/AdminError.ts'
import type {
  AdminUser,
  CreateUserInput,
  UpdateUserInput,
  UserDirectory,
} from '../../../../supabase/functions/_shared/admin-users/types.ts'

export const UNKNOWN_USER_ID = '00000000-0000-4000-8000-000000000999'

function toUserId(sequenceNumber: number): string {
  return `00000000-0000-4000-8000-${String(sequenceNumber).padStart(12, '0')}`
}

export class InMemoryUserDirectory implements UserDirectory {
  private readonly users = new Map<string, AdminUser>()
  private nextSequenceNumber = 1

  seed(user: Partial<AdminUser> & Pick<AdminUser, 'email' | 'role'>): AdminUser {
    const seededUser: AdminUser = {
      id: toUserId(this.nextSequenceNumber++),
      displayName: null,
      cooldownHours: 24,
      mustChangePassword: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      lastSignInAt: null,
      ...user,
    }
    this.users.set(seededUser.id, seededUser)
    return seededUser
  }

  async find(userId: string): Promise<AdminUser | null> {
    return this.users.get(userId) ?? null
  }

  async list(): Promise<AdminUser[]> {
    return [...this.users.values()]
  }

  async countAdmins(): Promise<number> {
    return [...this.users.values()].filter((user) => user.role === 'admin').length
  }

  async create(newUser: CreateUserInput): Promise<AdminUser> {
    const { password: _password, ...profile } = newUser
    const isDuplicateEmail = [...this.users.values()].some((user) => user.email === newUser.email)
    if (isDuplicateEmail) throw new AdminError('conflict', 'email already registered')
    return this.seed(profile)
  }

  async update(userId: string, changes: UpdateUserInput): Promise<AdminUser> {
    const currentUser = this.users.get(userId)
    if (!currentUser) throw new AdminError('not_found', 'user not found')
    const { password: _password, ...profileChanges } = changes
    const updatedUser = { ...currentUser, ...profileChanges }
    this.users.set(userId, updatedUser)
    return updatedUser
  }

  async remove(userId: string): Promise<void> {
    this.users.delete(userId)
  }
}
