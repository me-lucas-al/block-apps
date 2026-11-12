import { ValidationError } from '../../../domain/errors/ValidationError'

export function readRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${label} must be an object`)
  }
  return Object.fromEntries(Object.entries(value))
}
