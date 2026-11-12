import type { CreateUserInput } from '../../../../users/model/userInputs'
import { parseCooldownHours } from '../fields/parseCooldownHours'
import { parseDisplayName } from '../fields/parseDisplayName'
import { parseEmail } from '../fields/parseEmail'
import { parseRole } from '../fields/parseRole'

const DEFAULT_COOLDOWN_HOURS = 24

export function parseCreateUserBody(body: Record<string, unknown>): CreateUserInput {
  return {
    email: parseEmail(body['email']),
    displayName: body['displayName'] === undefined ? null : parseDisplayName(body['displayName']),
    role: body['role'] === undefined ? 'user' : parseRole(body['role']),
    cooldownHours:
      body['cooldownHours'] === undefined
        ? DEFAULT_COOLDOWN_HOURS
        : parseCooldownHours(body['cooldownHours']),
  }
}
