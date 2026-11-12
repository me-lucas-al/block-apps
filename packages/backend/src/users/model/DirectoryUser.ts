import type { UserRole } from './AdminUser'

export type DirectoryUser = {
  readonly id: string
  readonly username: string
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly enabled: boolean
  readonly federated: boolean
  readonly mustChangePassword: boolean
  readonly mfaActive: boolean
  readonly createdAt: string
}
