import { normalizeSiteTarget, type TargetType } from '@block-apps/core'
import { ValidationError } from '../errors/ValidationError'

const APP_IDENTIFIER = /^[A-Za-z0-9._-]{1,253}$/

export function normalizeRuleTarget(targetType: TargetType, rawTarget: string): string {
  if (targetType === 'site') {
    const hostname = normalizeSiteTarget(rawTarget)
    if (!hostname) throw new ValidationError('target must be a valid domain')
    return hostname
  }
  const appIdentifier = rawTarget.trim()
  if (!APP_IDENTIFIER.test(appIdentifier)) {
    throw new ValidationError('target must contain only letters, digits, dots, hyphens and underscores')
  }
  return appIdentifier
}
