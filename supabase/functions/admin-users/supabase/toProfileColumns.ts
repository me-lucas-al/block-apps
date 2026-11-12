import type { UpdateUserInput } from '../../_shared/admin-users/types.ts'

export function toProfileColumns(changes: UpdateUserInput): Record<string, unknown> {
  const profileColumns: Record<string, unknown> = {}
  if (changes.displayName !== undefined) profileColumns.display_name = changes.displayName
  if (changes.role !== undefined) profileColumns.role = changes.role
  if (changes.cooldownHours !== undefined) profileColumns.cooldown_hours = changes.cooldownHours
  if (changes.mustChangePassword !== undefined) {
    profileColumns.must_change_password = changes.mustChangePassword
  }
  return profileColumns
}
