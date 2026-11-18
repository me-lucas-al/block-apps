import { ValidationError } from '../domain/errors/ValidationError'

export function validateTimeZone(timeZone: string): void {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
  } catch {
    throw new ValidationError('timeZone must be a valid IANA time zone')
  }
}
