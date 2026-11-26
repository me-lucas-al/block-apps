import { ValidationError } from '../../domain/errors/ValidationError'

const INVALID_TIME_ZONE_MESSAGE = 'timeZone must be a valid IANA time zone such as America/Sao_Paulo'

function resolveCanonicalName(timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone
  } catch {
    throw new ValidationError(INVALID_TIME_ZONE_MESSAGE)
  }
}

export function canonicalizeTimeZone(timeZone: string): string {
  const isAreaAndCity = timeZone.includes('/')
  if (!isAreaAndCity && timeZone.toUpperCase() !== 'UTC') {
    throw new ValidationError(INVALID_TIME_ZONE_MESSAGE)
  }
  return resolveCanonicalName(timeZone)
}
