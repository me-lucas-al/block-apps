export type UserRole = 'user' | 'admin'

export type AdminUser = {
  readonly id: string
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly cooldownHours: number
  readonly mustChangePassword: boolean
  readonly createdAt: string
  readonly lastSignInAt: string | null
}
