import { ValidationError } from '../../../domain/errors/ValidationError'

export function readTextField(record: Record<string, unknown>, field: string): string {
  const text = record[field]
  if (typeof text !== 'string' || text.length === 0) {
    throw new ValidationError(`${field} must be a non-empty string`)
  }
  return text
}
