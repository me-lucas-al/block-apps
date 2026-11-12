import type { UserRole } from '../../model/adminUser.ts'
import { invalidFieldError } from './invalidFieldError.ts'

const MAX_DISPLAY_NAME_LENGTH = 80
const MAX_COOLDOWN_HOURS = 168

export function parseDisplayName(rawDisplayName: unknown): string | null {
  if (rawDisplayName === null) return null
  if (typeof rawDisplayName !== 'string') throw invalidFieldError('displayName', 'must be text')
  const displayName = rawDisplayName.trim()
  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    throw invalidFieldError('displayName', `must have at most ${MAX_DISPLAY_NAME_LENGTH} characters`)
  }
  return displayName === '' ? null : displayName
}

export function parseRole(rawRole: unknown): UserRole {
  if (rawRole !== 'user' && rawRole !== 'admin') {
    throw invalidFieldError('role', 'must be user or admin')
  }
  return rawRole
}

export function parseCooldownHours(rawCooldownHours: unknown): number {
  const isWholeHoursWithinLimit =
    Number.isInteger(rawCooldownHours) &&
    (rawCooldownHours as number) >= 0 &&
    (rawCooldownHours as number) <= MAX_COOLDOWN_HOURS
  if (!isWholeHoursWithinLimit) {
    throw invalidFieldError('cooldownHours', `must be an integer between 0 and ${MAX_COOLDOWN_HOURS}`)
  }
  return rawCooldownHours as number
}

export function parseBooleanField(field: string, rawFlag: unknown): boolean {
  if (typeof rawFlag !== 'boolean') throw invalidFieldError(field, 'must be true or false')
  return rawFlag
}
