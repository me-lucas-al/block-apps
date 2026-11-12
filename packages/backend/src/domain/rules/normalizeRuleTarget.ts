import { ValidationError } from '../errors/ValidationError'

const ALLOWED_TARGET = /^[a-z0-9._-]{1,253}$/

export function normalizeRuleTarget(rawTarget: string): string {
  const target = rawTarget.trim().toLowerCase()
  if (!ALLOWED_TARGET.test(target)) {
    throw new ValidationError('target must contain only letters, digits, dots, hyphens and underscores')
  }
  return target
}
