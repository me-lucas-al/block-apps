import type { UserRole } from '../model/AdminUser'
import type { DirectoryUser } from '../model/DirectoryUser'

export type NewDirectoryUser = {
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
}

export interface UserCreator {
  create(newUser: NewDirectoryUser): Promise<DirectoryUser>
}
