import { ValidationError } from '../../../../domain/errors/ValidationError'

const MAX_DISPLAY_NAME_LENGTH = 80

export function parseDisplayName(rawDisplayName: unknown): string | null {
  if (rawDisplayName === null) return null
  if (typeof rawDisplayName !== 'string') throw new ValidationError('displayName must be text')
  const displayName = rawDisplayName.trim()
  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new ValidationError(`displayName must have at most ${MAX_DISPLAY_NAME_LENGTH} characters`)
  }
  return displayName === '' ? null : displayName
}
