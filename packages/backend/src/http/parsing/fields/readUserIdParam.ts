import type { Context } from 'hono'
import { ValidationError } from '../../../domain/errors/ValidationError'

const MAX_USER_ID_LENGTH = 128

export function readUserIdParam(context: Context): string {
  const userId = context.req.param('userId') ?? ''
  if (userId.length === 0 || userId.length > MAX_USER_ID_LENGTH) {
    throw new ValidationError('userId has an invalid length')
  }
  return userId
}
