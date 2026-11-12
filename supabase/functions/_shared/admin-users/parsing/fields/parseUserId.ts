import { invalidFieldError } from './invalidFieldError.ts'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseUserId(rawUserId: unknown): string {
  if (typeof rawUserId !== 'string' || !UUID_PATTERN.test(rawUserId)) {
    throw invalidFieldError('id', 'must be a valid user id')
  }
  return rawUserId
}
