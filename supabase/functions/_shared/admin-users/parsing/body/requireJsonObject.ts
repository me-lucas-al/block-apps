import { AdminError } from '../../AdminError.ts'

export function requireJsonObject(rawBody: unknown): Record<string, unknown> {
  if (typeof rawBody !== 'object' || rawBody === null || Array.isArray(rawBody)) {
    throw new AdminError('invalid_input', 'body must be an object')
  }
  return rawBody as Record<string, unknown>
}
