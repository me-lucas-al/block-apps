import { ValidationError } from '../../../../domain/errors/ValidationError'

const MAX_COOLDOWN_HOURS = 168

export function parseCooldownHours(rawCooldownHours: unknown): number {
  if (
    typeof rawCooldownHours !== 'number' ||
    !Number.isInteger(rawCooldownHours) ||
    rawCooldownHours < 0 ||
    rawCooldownHours > MAX_COOLDOWN_HOURS
  ) {
    throw new ValidationError(`cooldownHours must be an integer between 0 and ${MAX_COOLDOWN_HOURS}`)
  }
  return rawCooldownHours
}
