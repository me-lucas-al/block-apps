import { ValidationError } from '../../../../domain/errors/ValidationError'
import type { UserRole } from '../../../../users/model/AdminUser'

export function parseRole(rawRole: unknown): UserRole {
  if (rawRole !== 'user' && rawRole !== 'admin') throw new ValidationError('role must be user or admin')
  return rawRole
}
