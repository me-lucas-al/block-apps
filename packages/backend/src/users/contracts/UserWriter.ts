import type { UserRole } from '../model/AdminUser'
import type { DirectoryUser } from '../model/DirectoryUser'

export type NewDirectoryUser = {
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
}

export interface UserWriter {
  create(newUser: NewDirectoryUser): Promise<DirectoryUser>
  updateDisplayName(userId: string, displayName: string | null): Promise<void>
  changeRole(userId: string, from: UserRole, to: UserRole): Promise<void>
  forcePasswordReset(userId: string): Promise<void>
  remove(userId: string): Promise<void>
}
