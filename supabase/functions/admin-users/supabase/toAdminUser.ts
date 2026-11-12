import type { AdminUser } from '../../_shared/admin-users/types.ts'
import type { AuthUserRecord, ProfileRecord } from './profileRecords.ts'

const LEAST_PRIVILEGED_PROFILE = {
  role: 'user',
  display_name: null,
  cooldown_hours: 24,
  must_change_password: false,
} as const

export function toAdminUser(authUser: AuthUserRecord, profile: ProfileRecord | undefined): AdminUser {
  const effectiveProfile = profile ?? LEAST_PRIVILEGED_PROFILE
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    displayName: effectiveProfile.display_name,
    role: effectiveProfile.role,
    cooldownHours: effectiveProfile.cooldown_hours,
    mustChangePassword: effectiveProfile.must_change_password,
    createdAt: authUser.created_at,
    lastSignInAt: authUser.last_sign_in_at ?? null,
  }
}
