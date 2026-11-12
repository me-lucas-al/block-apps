import { AdminError } from '../../AdminError.ts'
import type { UpdateUserInput } from '../../model/userInputs.ts'
import { parseEmail, parsePassword } from '../fields/parseCredentials.ts'
import {
  parseBooleanField,
  parseCooldownHours,
  parseDisplayName,
  parseRole,
} from '../fields/parseProfileFields.ts'
import { requireJsonObject } from './requireJsonObject.ts'

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
    changes.mustChangePassword = parseBooleanField(
      'mustChangePassword',
      requestedChanges.mustChangePassword,
    )
  }
  if (Object.keys(changes).length === 0) {
    throw new AdminError('invalid_input', 'at least one field must be provided')
  }
  return changes
}
