import type { UserRole } from './adminUser.ts'

export type CreateUserInput = {
  readonly email: string
  readonly password: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly cooldownHours: number
  readonly mustChangePassword: boolean
}

export type UpdateUserInput = Partial<CreateUserInput>
