import { ValidationError } from '../../../../domain/errors/ValidationError'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254

export function parseEmail(rawEmail: unknown): string {
  if (typeof rawEmail !== 'string') throw new ValidationError('email must be text')
  const email = rawEmail.trim().toLowerCase()
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw new ValidationError('email must be a valid address')
  }
  return email
}
