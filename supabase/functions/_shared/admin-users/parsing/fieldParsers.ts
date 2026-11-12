import { AdminError } from '../AdminError.ts'
import type { UserRole } from '../types.ts'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_EMAIL_LENGTH = 254
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72
const MAX_DISPLAY_NAME_LENGTH = 80
const MAX_COOLDOWN_HOURS = 168

function invalidFieldError(field: string, requirement: string): AdminError {
  return new AdminError('invalid_input', `${field} ${requirement}`)
}

export function parseEmail(rawEmail: unknown): string {
  if (typeof rawEmail !== 'string') throw invalidFieldError('email', 'must be text')
  const email = rawEmail.trim().toLowerCase()
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw invalidFieldError('email', 'must be a valid address')
  }
  return email
}

export function parsePassword(rawPassword: unknown): string {
  if (typeof rawPassword !== 'string') throw invalidFieldError('password', 'must be text')
  if (rawPassword.length < MIN_PASSWORD_LENGTH || rawPassword.length > MAX_PASSWORD_LENGTH) {
    throw invalidFieldError(
      'password',
      `must have between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    )
  }
  return rawPassword
}

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

export function parseUserId(rawUserId: unknown): string {
  if (typeof rawUserId !== 'string' || !UUID_PATTERN.test(rawUserId)) {
    throw invalidFieldError('id', 'must be a valid user id')
  }
  return rawUserId
}
