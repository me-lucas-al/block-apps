import { invalidFieldError } from './invalidFieldError.ts'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72

export function parseEmail(rawEmail: unknown): string {
  if (typeof rawEmail !== 'string') throw invalidFieldError('email', 'must be text')
  const email = rawEmail.trim().toLowerCase()
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw invalidFieldError('email', 'must be a valid address')
  }
  return email
}

export function parsePassword(rawPassword: unknown): string {
  if (typeof rawPassword !== 'string') throw invalidFieldError('password', 'must be text')
  if (rawPassword.length < MIN_PASSWORD_LENGTH || rawPassword.length > MAX_PASSWORD_LENGTH) {
    throw invalidFieldError(
      'password',
      `must have between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    )
  }
  return rawPassword
}
