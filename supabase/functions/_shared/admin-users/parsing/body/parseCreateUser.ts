import type { CreateUserInput } from '../../model/userInputs.ts'
import { parseEmail, parsePassword } from '../fields/parseCredentials.ts'
import {
  parseBooleanField,
  parseCooldownHours,
  parseDisplayName,
  parseRole,
} from '../fields/parseProfileFields.ts'
import { requireJsonObject } from './requireJsonObject.ts'

const DEFAULT_COOLDOWN_HOURS = 24

export function parseCreateUser(rawUser: unknown): CreateUserInput {
  const requestedUser = requireJsonObject(rawUser)
  return {
    email: parseEmail(requestedUser.email),
    password: parsePassword(requestedUser.password),
    displayName: parseDisplayName(requestedUser.displayName ?? null),
    role: parseRole(requestedUser.role ?? 'user'),
    cooldownHours: parseCooldownHours(requestedUser.cooldownHours ?? DEFAULT_COOLDOWN_HOURS),
    mustChangePassword: parseBooleanField(
      'mustChangePassword',
      requestedUser.mustChangePassword ?? true,
    ),
  }
}
