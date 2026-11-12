import { AdminError } from '../AdminError.ts'
import type { CreateUserInput, UpdateUserInput } from '../types.ts'
import {
  parseCooldownHours,
  parseDisplayName,
  parseEmail,
  parseFlag,
  parsePassword,
  parseRole,
} from './fieldParsers.ts'

const DEFAULT_COOLDOWN_HOURS = 24

function requireJsonObject(rawBody: unknown): Record<string, unknown> {
  if (typeof rawBody !== 'object' || rawBody === null || Array.isArray(rawBody)) {
    throw new AdminError('invalid_input', 'body must be an object')
  }
  return rawBody as Record<string, unknown>
}

export function parseCreateUser(rawUser: unknown): CreateUserInput {
  const requestedUser = requireJsonObject(rawUser)
  return {
    email: parseEmail(requestedUser.email),
    password: parsePassword(requestedUser.password),
    displayName: parseDisplayName(requestedUser.displayName ?? null),
    role: parseRole(requestedUser.role ?? 'user'),
    cooldownHours: parseCooldownHours(requestedUser.cooldownHours ?? DEFAULT_COOLDOWN_HOURS),
    mustChangePassword: parseFlag('mustChangePassword', requestedUser.mustChangePassword ?? true),
  }
}

export function parseUpdateUser(rawChanges: unknown): UpdateUserInput {
  const requestedChanges = requireJsonObject(rawChanges)
  const changes: { -readonly [Key in keyof UpdateUserInput]: UpdateUserInput[Key] } = {}
  if (requestedChanges.email !== undefined) changes.email = parseEmail(requestedChanges.email)
  if (requestedChanges.password !== undefined) {
    changes.password = parsePassword(requestedChanges.password)
  }
  if (requestedChanges.displayName !== undefined) {
    changes.displayName = parseDisplayName(requestedChanges.displayName)
  }
  if (requestedChanges.role !== undefined) changes.role = parseRole(requestedChanges.role)
  if (requestedChanges.cooldownHours !== undefined) {
    changes.cooldownHours = parseCooldownHours(requestedChanges.cooldownHours)
  }
  if (requestedChanges.mustChangePassword !== undefined) {
    changes.mustChangePassword = parseFlag('mustChangePassword', requestedChanges.mustChangePassword)
  }
  if (Object.keys(changes).length === 0) {
    throw new AdminError('invalid_input', 'at least one field must be provided')
  }
  return changes
}
