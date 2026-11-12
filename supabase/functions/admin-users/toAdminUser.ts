import type { AdminUser, UserRole } from '../_shared/admin-users/types.ts'

export type AuthUserRecord = {
  id: string
  email?: string | null
  created_at: string
  last_sign_in_at?: string | null
}

export type ProfileRecord = {
  id: string
  role: UserRole
  display_name: string | null
  cooldown_hours: number
  must_change_password: boolean
}

export const PROFILE_COLUMNS = 'id, role, display_name, cooldown_hours, must_change_password'

export function toAdminUser(authUser: AuthUserRecord, profile: ProfileRecord): AdminUser {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    displayName: profile.display_name,
    role: profile.role,
    cooldownHours: profile.cooldown_hours,
    mustChangePassword: profile.must_change_password,
    createdAt: authUser.created_at,
    lastSignInAt: authUser.last_sign_in_at ?? null,
  }
}
