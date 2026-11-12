const MILLISECONDS_PER_HOUR = 60 * 60 * 1000

export function computeCooldownDeadline(now: Date, cooldownHours: number): string {
  return new Date(now.getTime() + cooldownHours * MILLISECONDS_PER_HOUR).toISOString()
}
