import { ValidationError } from '../../../../domain/errors/ValidationError'
import type { UpdateUserInput } from '../../../../users/model/userInputs'
import { parseCooldownHours } from '../fields/parseCooldownHours'
import { parseDisplayName } from '../fields/parseDisplayName'
import { parseRole } from '../fields/parseRole'

function parseResetPassword(rawFlag: unknown): boolean {
  if (typeof rawFlag !== 'boolean') throw new ValidationError('resetPassword must be true or false')
  return rawFlag
}

export function parseUpdateUserBody(body: Record<string, unknown>): UpdateUserInput {
  const changes: UpdateUserInput = {
    ...(body['displayName'] !== undefined && { displayName: parseDisplayName(body['displayName']) }),
    ...(body['role'] !== undefined && { role: parseRole(body['role']) }),
    ...(body['cooldownHours'] !== undefined && {
      cooldownHours: parseCooldownHours(body['cooldownHours']),
    }),
    ...(body['resetPassword'] !== undefined && {
      resetPassword: parseResetPassword(body['resetPassword']),
    }),
  }
  if (Object.keys(changes).length === 0) throw new ValidationError('no changes were sent')
  return changes
}
