import type { UserRole } from '../model/AdminUser'

export interface UserEditor {
  updateDisplayName(username: string, displayName: string | null): Promise<void>
  changeRole(username: string, from: UserRole, to: UserRole): Promise<void>
  forcePasswordReset(username: string): Promise<void>
}
