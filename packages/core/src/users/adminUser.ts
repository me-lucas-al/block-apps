export type UserRole = 'user' | 'admin'

export type AdminUser = {
  readonly id: string
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly cooldownHours: number
  readonly mustChangePassword: boolean
  readonly createdAt: string
}

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
