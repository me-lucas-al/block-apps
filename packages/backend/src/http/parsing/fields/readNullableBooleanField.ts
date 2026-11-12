import { ValidationError } from '../../../domain/errors/ValidationError'

export function readNullableBooleanField(
  record: Record<string, unknown>,
  field: string,
): boolean | null {
  const flag = record[field]
  if (flag === undefined || flag === null) return null
  if (typeof flag !== 'boolean') throw new ValidationError(`${field} must be a boolean or null`)
  return flag
}
