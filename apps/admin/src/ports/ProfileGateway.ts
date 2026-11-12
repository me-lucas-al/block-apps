import type { UserRole } from './userTypes'

export type MyProfile = {
  readonly id: string
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly mustChangePassword: boolean
}

export interface ProfileGateway {
  loadMyProfile(): Promise<MyProfile | null>
  updateMyDisplayName(displayName: string | null): Promise<void>
  changePassword(password: string): Promise<void>
}
