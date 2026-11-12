import type { Context } from 'hono'
import { ValidationError } from '../../../domain/errors/ValidationError'

const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function readUserIdParam(context: Context): string {
  const userId = context.req.param('userId') ?? ''
  if (!USER_ID_PATTERN.test(userId)) throw new ValidationError('userId must be a user id (UUID)')
  return userId.toLowerCase()
}
