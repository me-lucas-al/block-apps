import type { UserRole } from './AdminUser'

export type DirectoryUser = {
  readonly id: string
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly enabled: boolean
  readonly mustChangePassword: boolean
  readonly createdAt: string
}
