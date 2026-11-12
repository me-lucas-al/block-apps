import type { UserRole } from './AdminUser'

export type CreateUserInput = {
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly cooldownHours: number
}

export type UpdateUserInput = {
  readonly displayName?: string | null
  readonly role?: UserRole
  readonly cooldownHours?: number
  readonly resetPassword?: boolean
}
